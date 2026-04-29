// ═══════════════════════════════════════════════════════════════════
//  StudentHub.jsx  —  KhetLab Student Opportunity Hub  (v4)
//  Reads from /public/jobs-data.json — updated every 6h by GitHub Actions.
//  Features: Trust badges, rich detail modal, search, bookmarks,
//            "NEW" badge, live countdown, mobile-first UI.
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import "./StudentHub.css";

// ─── TAB CONFIG ──────────────────────────────────────────────────────
const TABS = [
  { id: "alljobs",     label: "All Jobs",          icon: "🏛️", color: "#4a7c59", desc: "Punjab govt exams + jobs from ALL fields — any student, any degree" },
  { id: "agriculture", label: "Agriculture",        icon: "🌱", color: "#92400e", desc: "Agriculture exams + jobs — ICAR, ASRB, PAU, NABARD & more" },
  { id: "private",     label: "Private Jobs",       icon: "💼", color: "#2563eb", desc: "Private sector jobs across all fields — fresher to experienced" },
];

// ─── UTILS ───────────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return "N/A";
  return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function computeCountdown(deadlineStr) {
  const now = new Date();
  const deadline = new Date(deadlineStr + "T23:59:59");
  const diffMs = deadline - now;
  
  if (isNaN(diffMs) || diffMs < 0) return { label: "Expired", cls: "dl--closed", closed: true, days: -1, hours: 0, mins: 0 };
  
  const days  = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const mins  = Math.floor((diffMs % 3600000) / 60000);
  
  if (days === 0 && hours === 0) return { label: `${mins}m left`, cls: "dl--urgent", closed: false, days, hours, mins };
  if (days === 0)                return { label: `${hours}h ${mins}m`, cls: "dl--urgent", closed: false, days, hours, mins };
  if (days <= 3)                 return { label: `${days}d ${hours}h`, cls: "dl--urgent", closed: false, days, hours, mins };
  if (days <= 7)                 return { label: `${days} days`, cls: "dl--soon", closed: false, days, hours, mins };
  return                                { label: `${days} days`, cls: "", closed: false, days, hours, mins };
}

// ─── COUNTDOWN HOOK ─────────────────────────────────────────────────
function useCountdown(deadlineStr) {
  const [cd, setCd] = useState(() => computeCountdown(deadlineStr));
  useEffect(() => {
    const id = setInterval(() => setCd(computeCountdown(deadlineStr)), 60000);
    return () => clearInterval(id);
  }, [deadlineStr]);
  return cd;
}

// ─── COUNTDOWN BADGE ────────────────────────────────────────────────
function CountdownBadge({ deadline }) {
  const cd = useCountdown(deadline);
  if (cd.closed) return <span className="countdown-badge countdown-badge--expired">❌ Expired</span>;
  return (
    <span className={`countdown-badge ${cd.cls === "dl--urgent" ? "countdown-badge--urgent" : cd.cls === "dl--soon" ? "countdown-badge--soon" : ""}`}>
      ⏱ {cd.label}
    </span>
  );
}

// ─── TRUST BADGE ────────────────────────────────────────────────────
function TrustBadge({ level }) {
  if (level === "official") return <span className="trust-badge trust-badge--official" title="Verified from official .gov.in source">✅ Official</span>;
  if (level === "aggregator") return <span className="trust-badge trust-badge--aggregator" title="From known job aggregator">⚠️ Aggregator</span>;
  if (level === "portal") return <span className="trust-badge trust-badge--portal" title="From job portal">📋 Portal</span>;
  return null;
}

// ─── NEW BADGE ──────────────────────────────────────────────────────
function NewBadge({ addedAt }) {
  if (!addedAt) return null;
  const added = new Date(addedAt);
  const now = new Date();
  const hoursDiff = (now - added) / (1000 * 60 * 60);
  if (hoursDiff > 48) return null;
  return <span className="new-badge">NEW</span>;
}

// ─── BOOKMARK HELPERS ───────────────────────────────────────────────
function getBookmarks() {
  try { return JSON.parse(localStorage.getItem("opstat_bookmarks") || "[]"); }
  catch { return []; }
}

function toggleBookmark(jobId) {
  const bm = getBookmarks();
  const idx = bm.indexOf(jobId);
  if (idx > -1) bm.splice(idx, 1);
  else bm.push(jobId);
  localStorage.setItem("opstat_bookmarks", JSON.stringify(bm));
  return bm;
}

// ─── SERPER LIVE SEARCH ──────────────────────────────────────────────
const SERPER_KEY = "162bfd42a7faf9df084e37582ea6ee2893d9bbff";
const JOB_SITES  = "site:freejobalert.com OR site:sarkariresult.com OR site:rojgarresult.com OR site:sarkariexam.com OR site:ssc.nic.in OR site:upsc.gov.in";

function LiveSearchPanel({ query, onClose }) {
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [searched, setSearched] = useState("");

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); setSearched(""); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      setSearched(query);
      try {
        const res = await fetch("https://google.serper.dev/search", {
          method: "POST",
          headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ q: `${query} ${JOB_SITES}`, num: 8 }),
        });
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const json = await res.json();
        setResults((json.organic || []).slice(0, 8));
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [query]);

  if (!query || query.length < 2) return null;

  const getDomain = (url) => {
    try { return new URL(url).hostname.replace("www.", ""); }
    catch { return ""; }
  };

  return (
    <div className="live-search-panel">
      <div className="live-search-panel__header">
        <span className="live-search-panel__title">🌐 Web Results for &ldquo;{searched || query}&rdquo;</span>
        <button className="live-search-panel__close" onClick={onClose}>✕</button>
      </div>

      {loading && (
        <div className="live-search-panel__loading">
          <div className="loading-spinner loading-spinner--sm" />
          <span>Searching job sites…</span>
        </div>
      )}

      {error && <div className="live-search-panel__error">⚠️ {error}</div>}

      {!loading && results.length > 0 && (
        <ul className="live-search-panel__list">
          {results.map((r, i) => (
            <li key={i} className="live-search-result">
              <a href={r.link} target="_blank" rel="noopener noreferrer" className="live-search-result__link">
                <span className="live-search-result__domain">{getDomain(r.link)}</span>
                <span className="live-search-result__title">{r.title}</span>
                {r.snippet && <span className="live-search-result__snippet">{r.snippet}</span>}
              </a>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && results.length === 0 && searched && (
        <div className="live-search-panel__empty">No results found. Try a different keyword.</div>
      )}
    </div>
  );
}

// ─── LINK STATUS INDICATOR ───────────────────────────────────────────
function LinkStatusDot({ status }) {
  if (status === "live")  return <span className="link-dot link-dot--live" title="Verified working">●</span>;
  if (status === "dead")  return <span className="link-dot link-dot--dead" title="Link may not work">●</span>;
  return null;
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────
function EmptyState({ tab }) {
  const tabInfo = TABS.find(t => t.id === tab);
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{tabInfo?.icon}</div>
      <h3 className="empty-state__title">No new listings yet</h3>
      <p className="empty-state__msg">
        We search for fresh {tab === "exams" ? "exam notifications" : "jobs"} every morning at 9:00 AM.
        Nothing new has been posted yet for this category — check back tomorrow.
      </p>
      <p className="empty-state__sub">We update daily. Every new listing appears here within 24 hours of being posted.</p>
    </div>
  );
}

// ─── JOB CARD (with trust badge, NEW badge, bookmark) ───────────────
function JobCard({ job, onOpen, isBookmarked, onBookmark }) {
  const tab = TABS.find(t => t.id === job.type) || TABS[0];
  const cd  = useCountdown(job.deadline);

  return (
    <article
      className={`job-card ${cd.cls} ${cd.closed ? "job-card--closed" : ""}`}
      onClick={() => onOpen(job)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onOpen(job)}
    >
      <div className="job-card__left">
        <div className="job-card__icon">{tab.icon}</div>
        <span className="job-card__type-badge"
          style={{ background: tab.color + "15", color: tab.color, borderColor: tab.color + "35" }}>
          {job.type === "alljobs" ? "All" : job.type === "agriculture" ? "Agri" : "Private"}
        </span>
      </div>

      <div className="job-card__body">
        <div className="job-card__top">
          <h3 className="job-card__title">
            {job.title}
            <NewBadge addedAt={job.addedAt} />
          </h3>
          <div className="job-card__top-right">
            <TrustBadge level={job.trustLevel} />
            <CountdownBadge deadline={job.deadline} />
          </div>
        </div>

        <p className="job-card__org">
          <strong>{job.organization}</strong>
          <span className="job-card__sep">·</span>
          <span className="job-card__loc">📍 {job.location}</span>
          {job.vacancies && job.vacancies !== "Not Specified" && (
            <span className="job-card__vacancies"> · 👥 {job.vacancies}</span>
          )}
          {job.sourceWebsite && (
            <span className="job-card__source"> · via {job.sourceWebsite}</span>
          )}
        </p>

        <p className="job-card__desc">{job.description}</p>

        <div className="job-card__footer">
          <span className="job-card__salary">💰 {job.salary}</span>
          <span className="job-card__posted">Posted {fmtDate(job.postedDate)}</span>
          <div className="job-card__tags">
            {(job.tags || []).slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          <button
            className={`job-card__bookmark ${isBookmarked ? "job-card__bookmark--active" : ""}`}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this"}
            onClick={e => { e.stopPropagation(); onBookmark(job.id); }}
          >
            {isBookmarked ? "★" : "☆"}
          </button>
          <button className="job-card__cta" onClick={e => { e.stopPropagation(); onOpen(job); }}>
            View Details →
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── DETAIL MODAL (rich data: dates, syllabus, trust, links) ────────
function Modal({ job, onClose, isBookmarked, onBookmark }) {
  const tab = TABS.find(t => t.id === job.type) || TABS[0];
  const cd  = useCountdown(job.deadline);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [onClose]);

  const hasOfficialLink = job.applyLink && job.applyLink.startsWith("http");
  const hasAggregatorLink = job.aggregatorLink && job.aggregatorLink.startsWith("http");
  const officialDead = job.applyLinkStatus === "dead";
  const aggDead = job.aggregatorLinkStatus === "dead";
  const hasNotifPdf = job.notificationPdfLink && job.notificationPdfLink.startsWith("http");
  const hasSyllabus = job.syllabusLink && job.syllabusLink.startsWith("http");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        {/* Header */}
        <div className="modal__header">
          <div className="modal__header-top">
            <span className="modal__type-pill" style={{ background: tab.color + "18", color: tab.color }}>
              {tab.icon} {tab.label}
            </span>
            <TrustBadge level={job.trustLevel} />
            <CountdownBadge deadline={job.deadline} />
            <button className="modal__close" onClick={onClose}>✕</button>
          </div>
          <h2 className="modal__title">
            {job.title}
            <NewBadge addedAt={job.addedAt} />
          </h2>
          <p className="modal__org">
            <strong>{job.organization}</strong>
            <span className="job-card__sep"> · </span>
            📍 {job.location}
            {job.vacancies && job.vacancies !== "Not Specified" && (
              <span> · 👥 {job.vacancies} posts</span>
            )}
          </p>

          {/* Key Info pills */}
          <div className="modal__pills">
            <div className="modal__pill">
              <span className="pill-label">Salary / Stipend</span>
              <span className="pill-val">💰 {job.salary}</span>
            </div>
            <div className="modal__pill">
              <span className="pill-label">Last Date to Apply</span>
              <span className={`pill-val ${cd.cls}`}>
                📅 {fmtDate(job.deadline)} ({cd.label})
              </span>
            </div>
            {job.examDate && job.examDate !== "Not Announced" && (
              <div className="modal__pill">
                <span className="pill-label">Exam Date</span>
                <span className="pill-val">📝 {fmtDate(job.examDate)}</span>
              </div>
            )}
            {job.admitCardDate && job.admitCardDate !== "Not Announced" && (
              <div className="modal__pill">
                <span className="pill-label">Admit Card</span>
                <span className="pill-val">🎫 {fmtDate(job.admitCardDate)}</span>
              </div>
            )}
            <div className="modal__pill">
              <span className="pill-label">Posted On</span>
              <span className="pill-val">🗓 {fmtDate(job.postedDate)}</span>
            </div>
            {job.verifiedAt && (
              <div className="modal__pill">
                <span className="pill-label">Verified</span>
                <span className="pill-val">
                  {job.officiallyVerified ? "✅" : "⚠️"} {fmtDate(job.verifiedAt)}
                  {job.verificationSource && <span className="pill-sub"> via {job.verificationSource}</span>}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="modal__body">
          <section className="modal__section">
            <h4 className="modal__sec-title">About this opportunity</h4>
            <p className="modal__sec-text">{job.description}</p>
          </section>

          <section className="modal__section">
            <h4 className="modal__sec-title">Requirements & Eligibility</h4>
            <ul className="modal__req">
              {(job.requirements || []).map((r, i) => (
                <li key={i}><span className="req-check">✓</span>{r}</li>
              ))}
            </ul>
          </section>

          {/* Important Dates Timeline */}
          {(job.postedDate || job.deadline || job.examDate || job.admitCardDate) && (
            <section className="modal__section">
              <h4 className="modal__sec-title">Important Dates</h4>
              <div className="modal__timeline">
                {job.postedDate && (
                  <div className="timeline-item">
                    <span className="timeline-dot timeline-dot--done">●</span>
                    <span className="timeline-label">Notification</span>
                    <span className="timeline-date">{fmtDate(job.postedDate)}</span>
                  </div>
                )}
                {job.deadline && job.deadline !== "Not Specified" && (
                  <div className={`timeline-item ${cd.closed ? "timeline-item--past" : "timeline-item--active"}`}>
                    <span className={`timeline-dot ${cd.closed ? "timeline-dot--past" : "timeline-dot--active"}`}>●</span>
                    <span className="timeline-label">Last Date to Apply</span>
                    <span className="timeline-date">{fmtDate(job.deadline)}</span>
                  </div>
                )}
                {job.admitCardDate && job.admitCardDate !== "Not Announced" && (
                  <div className="timeline-item">
                    <span className="timeline-dot">●</span>
                    <span className="timeline-label">Admit Card</span>
                    <span className="timeline-date">{fmtDate(job.admitCardDate)}</span>
                  </div>
                )}
                {job.examDate && job.examDate !== "Not Announced" && (
                  <div className="timeline-item">
                    <span className="timeline-dot">●</span>
                    <span className="timeline-label">Exam Date</span>
                    <span className="timeline-date">{fmtDate(job.examDate)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {(job.tags || []).length > 0 && (
            <section className="modal__section">
              <h4 className="modal__sec-title">Tags</h4>
              <div className="modal__tags">
                {job.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </section>
          )}
        </div>

        {/* Footer — action buttons */}
        <div className="modal__footer">
          <p className="modal__disclaimer">
            Sourced from <strong>{job.sourceWebsite || "official website"}</strong>.
            {job.officiallyVerified
              ? ` Verified from ${job.verificationSource || "official source"}.`
              : " Always verify details on the official portal before applying."}
          </p>

          {/* Quick action links (PDF, Syllabus) */}
          {(hasNotifPdf || hasSyllabus) && (
            <div className="modal__quick-links">
              {hasNotifPdf && (
                <a href={job.notificationPdfLink} target="_blank" rel="noopener noreferrer" className="quick-link">
                  📄 Official Notification PDF
                </a>
              )}
              {hasSyllabus && (
                <a href={job.syllabusLink} target="_blank" rel="noopener noreferrer" className="quick-link">
                  📚 Syllabus
                </a>
              )}
            </div>
          )}
          
          <div className="modal__link-buttons">
            {hasOfficialLink && (
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-official ${officialDead ? "btn-official--dead" : ""}`}
                style={!officialDead ? { background: tab.color } : {}}
              >
                <LinkStatusDot status={job.applyLinkStatus} />
                🌐 {officialDead ? "Official Portal (may not work)" : "Apply on Official Portal"}
              </a>
            )}

            {hasAggregatorLink && (
              <a
                href={job.aggregatorLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-aggregator ${aggDead ? "btn-aggregator--dead" : ""}`}
              >
                <LinkStatusDot status={job.aggregatorLinkStatus} />
                📰 View on {job.sourceWebsite || "Source"}
              </a>
            )}

            {!hasAggregatorLink && hasOfficialLink && (
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ background: tab.color }}
              >
                Apply / View Notification →
              </a>
            )}

            <div className="modal__bottom-row">
              <button
                className={`btn-bookmark ${isBookmarked ? "btn-bookmark--active" : ""}`}
                onClick={() => onBookmark(job.id)}
              >
                {isBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
              </button>
              <button className="btn-secondary" onClick={onClose}>← Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
export default function StudentHub() {
  const [activeTab,   setActiveTab]   = useState("alljobs");
  const [data,        setData]        = useState({ alljobs: [], agriculture: [], private: [] });
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [search,      setSearch]      = useState("");
  const [bookmarks,   setBookmarks]   = useState(getBookmarks);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const tabsRef = useRef(null);

  // Fetch the static JSON file once when the page loads
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/jobs-data.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData({
          alljobs:     json.alljobs     || [],
          agriculture: json.agriculture || [],
          private:     json.private     || [],
        });
        setLastUpdated(json.lastUpdated);
        if (json.lastError) setError(`Last update had an issue: ${json.lastError}`);
      } catch (err) {
        setError("Could not load jobs data. Please check back soon.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBookmark = useCallback((jobId) => {
    const updated = toggleBookmark(jobId);
    setBookmarks([...updated]);
  }, []);

  const activeInfo = TABS.find(t => t.id === activeTab);

  // Filter + sort jobs
  const activeJobs = useMemo(() => {
    let jobs = [...(data[activeTab] || [])];

    // Bookmark filter
    if (showBookmarksOnly) {
      jobs = jobs.filter(j => bookmarks.includes(j.id));
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j =>
        (j.title || "").toLowerCase().includes(q) ||
        (j.organization || "").toLowerCase().includes(q) ||
        (j.location || "").toLowerCase().includes(q) ||
        (j.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort: open (soonest deadline) → no-deadline (newest addedAt) → expired
    jobs.sort((a, b) => {
      const now = new Date();
      const dlA = a.deadline && a.deadline !== "Not Specified" ? new Date(a.deadline + "T23:59:59") : null;
      const dlB = b.deadline && b.deadline !== "Not Specified" ? new Date(b.deadline + "T23:59:59") : null;
      const expA = dlA && dlA < now;
      const expB = dlB && dlB < now;

      // Group 1: has deadline & not expired → first
      // Group 2: no deadline → middle
      // Group 3: expired → last
      const groupA = expA ? 3 : dlA ? 1 : 2;
      const groupB = expB ? 3 : dlB ? 1 : 2;
      if (groupA !== groupB) return groupA - groupB;

      // Within group 1: soonest deadline first
      if (groupA === 1 && dlA && dlB) return dlA - dlB;

      // Within group 2 & 3: newest addedAt first
      const addA = a.addedAt ? new Date(a.addedAt) : new Date(0);
      const addB = b.addedAt ? new Date(b.addedAt) : new Date(0);
      return addB - addA;
    });

    return jobs;
  }, [data, activeTab, search, showBookmarksOnly, bookmarks]);

  // Swipe support for mobile tabs
  const touchStart = useRef(null);
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    const idx = TABS.findIndex(t => t.id === activeTab);
    if (diff > 0 && idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
    if (diff < 0 && idx > 0)               setActiveTab(TABS[idx - 1].id);
    touchStart.current = null;
  };

  return (
    <div className="studenthub">

      {/* PAGE HEADER */}
      <header className="studenthub__header">
        <div className="studenthub__header-inner">
          <div>
            <div className="studenthub__breadcrumb">KhetLab → Student Hub</div>
            <h1 className="studenthub__title">
              Student <em>Opportunity Hub</em>
            </h1>
            <p className="studenthub__subtitle">
              Verified jobs &amp; exams for students in <strong>Punjab</strong> &amp; India — auto-updated
              every 6 hours from RSS feeds of 30+ official portals.
            </p>
          </div>
          <div className="studenthub__header-right">
            <div className="location-badge">📍 Punjab + All India</div>
            {lastUpdated && (
              <div className="studenthub__last-updated">
                Updated: {new Date(lastUpdated).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            )}
          </div>
        </div>

        {error && <div className="studenthub__error">{error}</div>}
      </header>

      {/* LIVE SEARCH BAR */}
      <div className="studenthub__search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search any job or exam (e.g. SSC CGL, IBPS PO)…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => { setSearch(""); }}>✕</button>
          )}
        </div>
        <button
          className={`bookmark-filter ${showBookmarksOnly ? "bookmark-filter--active" : ""}`}
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          title={showBookmarksOnly ? "Show all" : "Show bookmarks only"}
        >
          {showBookmarksOnly ? "★" : "☆"} {bookmarks.length > 0 && <span className="bookmark-count">{bookmarks.length}</span>}
        </button>
      </div>

      {/* LIVE WEB SEARCH RESULTS */}
      {search.trim().length >= 2 && (
        <LiveSearchPanel query={search.trim()} onClose={() => setSearch("")} />
      )}

      {/* TAB NAV (swipeable on mobile) */}
      <nav className="studenthub__tabs" ref={tabsRef}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`sh-tab ${activeTab === tab.id ? "sh-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id ? { borderColor: tab.color, color: tab.color } : {}}
          >
            <span className="sh-tab__icon">{tab.icon}</span>
            <span className="sh-tab__label">{tab.label}</span>
            <span
              className="sh-tab__count"
              style={activeTab === tab.id ? { background: tab.color, color: "#fff" } : {}}
            >
              {(data[tab.id] || []).length}
            </span>
          </button>
        ))}
      </nav>

      {/* TAB BANNER */}
      <div
        className="studenthub__banner"
        style={{ borderColor: activeInfo.color + "25", background: activeInfo.color + "07" }}
      >
        <span>{activeInfo.icon}</span>
        <div>
          <strong>{activeInfo.label}</strong>
          <span className="banner-desc"> — {activeInfo.desc}</span>
        </div>
        <span className="banner-count">
          {activeJobs.length} listing{activeJobs.length !== 1 ? "s" : ""}
          {search && " (filtered)"}
          {showBookmarksOnly && " (bookmarked)"}
        </span>
      </div>

      {/* LISTINGS (swipeable) */}
      <main
        className="studenthub__list"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <span>Loading latest opportunities…</span>
          </div>
        ) : activeJobs.length === 0 ? (
          search || showBookmarksOnly ? (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <h3 className="empty-state__title">
                {showBookmarksOnly ? "No bookmarks yet" : "No results found"}
              </h3>
              <p className="empty-state__msg">
                {showBookmarksOnly
                  ? "Bookmark jobs you're interested in and they'll appear here."
                  : `No listings match "${search}". Try a different keyword.`}
              </p>
              {(search || showBookmarksOnly) && (
                <button className="btn-secondary" style={{ marginTop: "1rem" }}
                  onClick={() => { setSearch(""); setShowBookmarksOnly(false); }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <EmptyState tab={activeTab} />
          )
        ) : (
          activeJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onOpen={setSelected}
              isBookmarked={bookmarks.includes(job.id)}
              onBookmark={handleBookmark}
            />
          ))
        )}
      </main>

      {/* FOOTER */}
      <footer className="studenthub__footer">
        <p>🤖 Listings are auto-fetched every 6 hours via RSS from FreeJobAlert, SarkariResult, RojgarResult, SarkariExam, and more. All links are verified with our 3-check system.</p>
        <p><strong>Always verify on the official website before applying.</strong> · ✅ Official = verified from .gov.in · ⚠️ Aggregator = from trusted job site</p>
      </footer>

      {/* MODAL */}
      {selected && (
        <Modal
          job={selected}
          onClose={() => setSelected(null)}
          isBookmarked={bookmarks.includes(selected.id)}
          onBookmark={handleBookmark}
        />
      )}
    </div>
  );
}
