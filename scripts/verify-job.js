// ═══════════════════════════════════════════════════════════════════
//  verify-job.js  —  3-Check Job/Exam Verification Module
//
//  CHECK 1: Source Trust Scoring (domain-based)
//  CHECK 2: Link Integrity (block Instagram, Telegram, shorteners)
//  CHECK 3: Cross-verification via Serper (is the job real?)
// ═══════════════════════════════════════════════════════════════════

// ── Blocked redirect domains ────────────────────────────────────
const BLOCKED_DOMAINS = [
  "instagram.com", "facebook.com", "fb.com", "t.me", "telegram.me",
  "twitter.com", "x.com", "youtube.com", "wa.me", "whatsapp.com",
  "bit.ly", "tinyurl.com", "shorturl.at", "cutt.ly", "rb.gy",
  "goo.gl", "ow.ly", "is.gd", "buff.ly", "adf.ly",
  "linktr.ee", "bio.link",
];

// ── Trust scores by domain pattern ──────────────────────────────
const TRUST_RULES = [
  { pattern: /\.gov\.in$/,                    trust: 100, level: "official" },
  { pattern: /\.nic\.in$/,                    trust: 100, level: "official" },
  { pattern: /\.ac\.in$/,                     trust: 90,  level: "official" },
  { pattern: /\.edu$/,                        trust: 90,  level: "official" },
  { pattern: /freejobalert\.com$/,            trust: 85,  level: "aggregator" },
  { pattern: /sarkariresult\.com$/,           trust: 85,  level: "aggregator" },
  { pattern: /sarkariexam\.com$/,             trust: 80,  level: "aggregator" },
  { pattern: /rojgarresult\.com$/,            trust: 80,  level: "aggregator" },
  { pattern: /sarkarinetwork\.com$/,          trust: 75,  level: "aggregator" },
  { pattern: /testbook\.com$/,                trust: 75,  level: "aggregator" },
  { pattern: /adda247\.com$/,                 trust: 75,  level: "aggregator" },
  { pattern: /jagranjosh\.com$/,              trust: 75,  level: "aggregator" },
  { pattern: /krishijagran\.com$/,            trust: 75,  level: "aggregator" },
  { pattern: /naukri\.com$/,                  trust: 70,  level: "portal" },
  { pattern: /indeed\.com$/,                  trust: 70,  level: "portal" },
  { pattern: /foundit\.in$/,                  trust: 70,  level: "portal" },
  { pattern: /freshersworld\.com$/,           trust: 65,  level: "portal" },
  { pattern: /internshala\.com$/,             trust: 65,  level: "portal" },
  { pattern: /unstop\.com$/,                  trust: 65,  level: "portal" },
];

// ── CHECK 1: Domain trust score ─────────────────────────────────
export function getTrustScore(url) {
  if (!url || !url.startsWith("http")) return { trust: 0, level: "unknown" };
  
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    
    for (const rule of TRUST_RULES) {
      if (rule.pattern.test(hostname)) {
        return { trust: rule.trust, level: rule.level, domain: hostname };
      }
    }
    
    return { trust: 30, level: "unknown", domain: hostname };
  } catch {
    return { trust: 0, level: "unknown" };
  }
}

// ── CHECK 2: Link integrity (block bad redirects) ───────────────
export async function verifyLinkIntegrity(url, timeout = 6000) {
  if (!url || !url.startsWith("http")) {
    return { status: "invalid", live: false, reason: "not a URL" };
  }

  // Pre-check: is the URL itself a blocked domain?
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (BLOCKED_DOMAINS.some(d => hostname.includes(d))) {
      return { status: "blocked", live: false, reason: `blocked domain: ${hostname}` };
    }
  } catch {
    return { status: "invalid", live: false, reason: "malformed URL" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Use GET instead of HEAD for better redirect following
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0"
      }
    });

    clearTimeout(timeoutId);

    // Check if the final URL redirected to a blocked domain
    const finalUrl = res.url || url;
    try {
      const finalHost = new URL(finalUrl).hostname.replace(/^www\./, "");
      if (BLOCKED_DOMAINS.some(d => finalHost.includes(d))) {
        return {
          status: "blocked",
          live: false,
          reason: `redirects to blocked domain: ${finalHost}`,
          finalUrl,
        };
      }
    } catch { /* ignore parse error on final URL */ }

    const live = res.status >= 200 && res.status < 400;
    return {
      status: live ? "live" : "dead",
      live,
      httpStatus: res.status,
      finalUrl,
    };
  } catch (err) {
    return { status: "dead", live: false, reason: err.message };
  }
}

// ── CHECK 3: Cross-verify with Google (Serper) ──────────────────
export async function crossVerify(orgName, title, serperApiKey) {
  if (!serperApiKey || !orgName) {
    return { verified: false, reason: "no API key or org name" };
  }

  const q = `"${orgName}" recruitment 2025 OR 2026 site:*.gov.in OR site:*.nic.in OR site:*.ac.in`;

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": serperApiKey,
      },
      body: JSON.stringify({ q, num: 5, gl: "in", hl: "en" }),
    });

    if (!res.ok) return { verified: false, reason: `Serper ${res.status}` };

    const data = await res.json();
    const results = data.organic || [];

    if (results.length === 0) {
      return { verified: false, reason: "no official results found" };
    }

    // Check if any result title/snippet matches our org name
    const orgLower = orgName.toLowerCase();
    const titleLower = (title || "").toLowerCase();

    for (const r of results) {
      const rTitle = (r.title || "").toLowerCase();
      const rSnippet = (r.snippet || "").toLowerCase();
      const combined = rTitle + " " + rSnippet;

      if (combined.includes(orgLower.slice(0, 15))) {
        return {
          verified: true,
          source: r.link,
          matchedIn: "google",
          reason: `found on ${new URL(r.link).hostname}`,
        };
      }
    }

    return { verified: false, reason: "org name not found in official results" };
  } catch (err) {
    return { verified: false, reason: err.message };
  }
}

// ── Combined verification for a single job item ─────────────────
export async function verifyJob(item, serperApiKey) {
  const result = {
    trustLevel: "unknown",
    trustScore: 0,
    applyLinkStatus: "unknown",
    aggregatorLinkStatus: "unknown",
    officiallyVerified: false,
    verificationSource: null,
    blocked: false,
    blockReason: null,
  };

  // Check 1: Trust scores for both links
  const applyTrust = getTrustScore(item.applyLink);
  const aggTrust = getTrustScore(item.aggregatorLink);
  result.trustScore = Math.max(applyTrust.trust, aggTrust.trust);
  result.trustLevel = applyTrust.trust >= aggTrust.trust ? applyTrust.level : aggTrust.level;

  // Auto-approve .gov.in / .nic.in / .ac.in sources
  if (applyTrust.trust >= 90) {
    result.officiallyVerified = true;
    result.verificationSource = applyTrust.domain;
  }

  // Check 2: Link integrity
  const [applyCheck, aggCheck] = await Promise.all([
    verifyLinkIntegrity(item.applyLink),
    verifyLinkIntegrity(item.aggregatorLink),
  ]);

  result.applyLinkStatus = applyCheck.status;
  result.aggregatorLinkStatus = aggCheck.status;

  // If both blocked, reject
  if (applyCheck.status === "blocked" && aggCheck.status === "blocked") {
    result.blocked = true;
    result.blockReason = `Both links blocked: ${applyCheck.reason}, ${aggCheck.reason}`;
    return result;
  }

  // If both dead, reject
  if (!applyCheck.live && !aggCheck.live) {
    result.blocked = true;
    result.blockReason = "Both links are dead";
    return result;
  }

  // If apply link is blocked but aggregator is fine, use aggregator
  if (applyCheck.status === "blocked" && aggCheck.live) {
    item.applyLink = item.aggregatorLink;
    result.applyLinkStatus = aggCheck.status;
  }

  // Check 3: Cross-verify for non-official sources (only if trust < 90)
  // We skip this for now to save Serper credits — only do on-demand
  // Uncomment below to enable:
  // if (!result.officiallyVerified && serperApiKey) {
  //   const cross = await crossVerify(item.organization, item.title, serperApiKey);
  //   result.officiallyVerified = cross.verified;
  //   result.verificationSource = cross.source || null;
  // }

  return result;
}
