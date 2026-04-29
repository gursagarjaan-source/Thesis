import React from 'react';

// ═══ Icons ═══
const Ic = ({ name, size = 14 }) => {
  const s = 1.5;
  const icons = {
    copy: <g stroke="currentColor" strokeWidth={s} fill="none"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 012-2h10"/></g>,
    download: <g stroke="currentColor" strokeWidth={s} fill="none" strokeLinecap="round"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{icons[name]}</svg>;
};

// ═══ Helpers ═══
const fmt = (n, d = 3) => n !== null && n !== undefined ? Number(n).toFixed(d) : '—';
const sigClass = (p) => {
  if (p === null || p === undefined) return '';
  if (p < 0.001) return 'sig-high';
  if (p < 0.01) return 'sig-medium';
  if (p < 0.05) return 'sig-low';
  return 'sig-ns';
};
const sigLabel = (p) => {
  if (p === null || p === undefined) return '—';
  if (p < 0.001) return `${fmt(p)} ***`;
  if (p < 0.01) return `${fmt(p)} **`;
  if (p < 0.05) return `${fmt(p)} *`;
  return `${fmt(p)} NS`;
};

const copyTable = (id) => {
  const table = document.getElementById(id);
  if (!table) return;
  const text = Array.from(table.rows).map(row =>
    Array.from(row.cells).map(c => c.innerText).join('\t')
  ).join('\n');
  navigator.clipboard.writeText(text);
};

const miniBtn = {
  padding: '4px 10px', background: 'var(--paper)', border: '1px solid var(--line)',
  borderRadius: 6, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-2)',
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
};

const Section = ({ label, children, tableId }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--muted)' }}>{label}</div>
      {tableId && <button style={miniBtn} onClick={() => copyTable(tableId)}><Ic name="copy" size={10}/> Copy</button>}
    </div>
    {children}
  </div>
);

const DataTable = ({ id, head, rows }) => (
  <table id={id} className="result-table">
    <thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>
      {rows.map((r, i) => (
        <tr key={i}>{r.map((c, j) => (
          <td key={j} className={j === r.length - 1 && typeof c === 'string' && (c.includes('*') || c.includes('NS')) ? sigClass(parseFloat(c)) : ''} style={{ fontWeight: j === 0 ? 600 : 400 }}>{c}</td>
        ))}</tr>
      ))}
    </tbody>
  </table>
);

const MetricGrid = ({ items }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
    {items.map(([k, v]) => (
      <div key={k} className="metric-card">
        <div className="metric-card-label">{k}</div>
        <div className="metric-card-value">{v}</div>
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════
//  ANOVA Result (for all DOE/biometrical tools)
// ═══════════════════════════════════════════
export const AnovaResult = ({ result }) => {
  if (!result || !result.anova) return null;
  const anovaRows = result.anova.map(r => [
    r.source, String(r.df), fmt(r.ss), fmt(r.ms), r.f ? fmt(r.f, 2) : '—', sigLabel(r.p)
  ]);
  const meanRows = (result.means || []).map(m => [m.label, fmt(m.mean), fmt(m.se)]);
  if (result.CD_5) meanRows.push(['C.D. (5%)', fmt(result.CD_5), '']);
  if (result.SE_m) meanRows.push(['SE(m)', fmt(result.SE_m), '']);
  if (result.SE_d) meanRows.push(['SE(d)', fmt(result.SE_d), '']);
  if (result.CV) meanRows.push(['C.V. (%)', fmt(result.CV), '']);

  return (
    <>
      <Section label="ANOVA TABLE" tableId="anova-tbl">
        <DataTable id="anova-tbl" head={['Source', 'df', 'SS', 'MS', 'F', 'p-value']} rows={anovaRows} />
      </Section>
      {meanRows.length > 0 && (
        <Section label="TREATMENT MEANS & STATISTICS" tableId="means-tbl">
          <DataTable id="means-tbl" head={['Treatment', 'Mean', 'S.E.']} rows={meanRows} />
        </Section>
      )}
      <Section label="KEY METRICS">
        <MetricGrid items={[
          ['SE(m)', fmt(result.SE_m)], ['SE(d)', fmt(result.SE_d)],
          ['C.V.', fmt(result.CV, 2) + '%'], ['C.D. (5%)', fmt(result.CD_5)],
        ]} />
      </Section>
      {result.means && result.means.length > 0 && (
        <Section label="TREATMENT MEANS OVERVIEW">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
            {result.means.map(m => (
              <div key={m.label} className="metric-card" style={{ textAlign: 'center' }}>
                <div className="metric-card-label">{m.label}</div>
                <div style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: 14 }}>{fmt(m.mean, 2)}</div>
              </div>
            ))}
            <div className="metric-card" style={{ textAlign: 'center', background: 'var(--ink)', color: 'var(--bg)', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 9, opacity: 0.7, fontFamily: 'var(--mono)', letterSpacing: '0.1em' }}>GRAND MEAN</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{fmt(result.grand_mean, 2)}</div>
            </div>
          </div>
        </Section>
      )}
    </>
  );
};

// ═══ Frequency Result ═══
export const FrequencyResult = ({ result }) => {
  if (!result) return null;
  const rows = result.rows.map(r => [
    `${fmt(r.lower, 1)} – ${fmt(r.upper, 1)}`, String(r.freq), fmt(r.rel, 1) + '%', String(r.cum)
  ]);
  return (
    <>
      <Section label="FREQUENCY DISTRIBUTION" tableId="freq-tbl">
        <DataTable id="freq-tbl" head={['Class Interval', 'Frequency', 'Relative %', 'Cumulative']} rows={rows} />
      </Section>
      <Section label="DESCRIPTIVE STATISTICS">
        <MetricGrid items={[
          ['N', String(result.n)], ['Mean', fmt(result.mean, 2)],
          ['Std Dev', fmt(result.std, 2)], ['Median', fmt(result.median, 2)],
          ['Min', fmt(result.min, 2)], ['Max', fmt(result.max, 2)],
        ]} />
      </Section>
    </>
  );
};

// ═══ Correlation Result ═══
export const CorrelationResult = ({ result }) => {
  if (!result) return null;
  const p = result.variables;
  const head = ['', ...Array.from({ length: p }, (_, i) => `X${i + 1}`)];
  const rows = result.matrix.map((row, i) => [
    `X${i + 1}`, ...row.map((v, j) => i === j ? '1.000' : fmt(v))
  ]);
  const pRows = result.pvalues.map((row, i) => [
    `X${i + 1}`, ...row.map((v, j) => i === j ? '—' : sigLabel(v))
  ]);
  return (
    <>
      <Section label="CORRELATION MATRIX" tableId="corr-tbl">
        <DataTable id="corr-tbl" head={head} rows={rows} />
      </Section>
      <Section label="SIGNIFICANCE (p-values)" tableId="corr-p-tbl">
        <DataTable id="corr-p-tbl" head={head} rows={pRows} />
      </Section>
      <Section label="SUMMARY">
        <MetricGrid items={[['N', String(result.n)], ['Variables', String(result.variables)]]} />
      </Section>
    </>
  );
};

// ═══ Regression Result ═══
export const RegressionResult = ({ result }) => {
  if (!result) return null;
  const cRows = result.coefficients.map(c => [c.name, fmt(c.coeff), fmt(c.se), fmt(c.t, 2), sigLabel(c.p)]);
  const aRows = result.anova.map(r => [r.source, String(r.df), fmt(r.ss), fmt(r.ms), r.f ? fmt(r.f, 2) : '—', sigLabel(r.p)]);
  return (
    <>
      <Section label="COEFFICIENTS" tableId="reg-coeff">
        <DataTable id="reg-coeff" head={['Variable', 'Coefficient', 'S.E.', 't', 'p-value']} rows={cRows} />
      </Section>
      <Section label="ANOVA TABLE" tableId="reg-anova">
        <DataTable id="reg-anova" head={['Source', 'df', 'SS', 'MS', 'F', 'p-value']} rows={aRows} />
      </Section>
      <Section label="MODEL FIT">
        <MetricGrid items={[['R²', fmt(result.R2, 4)], ['Adj R²', fmt(result.adjR2, 4)], ['N', String(result.n)]]} />
      </Section>
    </>
  );
};

// ═══ Comparing Means (t-test) Result ═══
export const MeansResult = ({ result }) => {
  if (!result) return null;
  return (
    <>
      <Section label={`${result.test.toUpperCase()} RESULT`}>
        <MetricGrid items={[
          ['t-statistic', fmt(result.t, 4)], ['p-value', fmt(result.p, 4)],
          ['Mean (Group 1)', fmt(result.mean1, 3)], ['Mean (Group 2)', fmt(result.mean2, 3)],
          ['SD (Group 1)', fmt(result.std1, 3)], ['SD (Group 2)', fmt(result.std2, 3)],
          ['n₁', String(result.n1)], ['n₂', String(result.n2)],
        ]} />
      </Section>
      <Section label="INTERPRETATION">
        <div style={{ padding: 16, background: result.p < 0.05 ? 'var(--green-soft)' : 'var(--bg-2)', borderRadius: 8, fontFamily: 'var(--serif)', fontSize: 14, lineHeight: 1.6 }}>
          {result.p < 0.05
            ? `The difference between group means is statistically significant (t = ${fmt(result.t, 3)}, p = ${fmt(result.p, 4)}). We reject the null hypothesis.`
            : `The difference between group means is not statistically significant (t = ${fmt(result.t, 3)}, p = ${fmt(result.p, 4)}). We fail to reject the null hypothesis.`
          }
        </div>
      </Section>
    </>
  );
};

// ═══ Crosstab Result ═══
export const CrosstabResult = ({ result }) => {
  if (!result) return null;
  const head = ['', ...result.col_labels.map(c => `Col ${c}`), 'Total'];
  const rows = result.table.map((row, i) => [
    `Row ${result.row_labels[i]}`, ...row.map(String), String(row.reduce((a, b) => a + b, 0))
  ]);
  return (
    <>
      <Section label="CONTINGENCY TABLE" tableId="ct-tbl">
        <DataTable id="ct-tbl" head={head} rows={rows} />
      </Section>
      <Section label="CHI-SQUARE TEST">
        <MetricGrid items={[['χ²', fmt(result.chi2, 3)], ['p-value', fmt(result.p, 4)], ['df', String(result.dof)]]} />
      </Section>
    </>
  );
};

// ═══ PCA Result ═══
export const PCAResult = ({ result }) => {
  if (!result) return null;
  const rows = result.components.map(c => [
    `PC${c.pc}`, fmt(c.eigenvalue, 3), fmt(c.proportion, 2) + '%', fmt(c.cumulative, 2) + '%'
  ]);
  return (
    <>
      <Section label="EIGENVALUES & VARIANCE" tableId="pca-tbl">
        <DataTable id="pca-tbl" head={['Component', 'Eigenvalue', 'Proportion', 'Cumulative']} rows={rows} />
      </Section>
      <Section label="COMPONENT LOADINGS" tableId="pca-load">
        <DataTable id="pca-load"
          head={['Variable', ...result.components.map(c => `PC${c.pc}`)]}
          rows={result.loadings.map((row, i) => [`X${i + 1}`, ...row.map(v => fmt(v, 3))])} />
      </Section>
    </>
  );
};

// ═══ Cluster Result ═══
export const ClusterResult = ({ result }) => {
  if (!result) return null;
  const rows = result.clusters.map(c => [
    `Cluster ${c.cluster}`, String(c.size), c.centroid.map(v => fmt(v, 2)).join(', '), c.members.join(', ')
  ]);
  return (
    <Section label="K-MEANS CLUSTERING" tableId="km-tbl">
      <DataTable id="km-tbl" head={['Cluster', 'Size', 'Centroid', 'Members']} rows={rows} />
    </Section>
  );
};

// ═══ Probit Result ═══
export const ProbitResult = ({ result }) => {
  if (!result) return null;
  return (
    <Section label="PROBIT ANALYSIS">
      <MetricGrid items={[
        ['LC₅₀', fmt(result.lc50, 3)], ['LC₉₀', fmt(result.lc90, 3)],
        ['Slope', fmt(result.slope, 4)], ['Intercept', fmt(result.intercept, 4)],
        ['R²', fmt(result.r2, 4)], ['N', String(result.n)],
      ]} />
    </Section>
  );
};

// ═══ Layout Result ═══
export const LayoutResult = ({ result }) => {
  if (!result) return null;
  return (
    <Section label={`RANDOMIZED LAYOUT (${result.design})`}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
        {result.layout.map((rep, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 4 }}>REPLICATION {i + 1}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rep.map((t, j) => (
                <div key={j} style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', background: 'var(--bg-2)', borderRadius: 6, fontWeight: 600, border: '1px solid var(--line)' }}>
                  T{t}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

// ═══ Path Analysis Result ═══
export const PathResult = ({ result }) => {
  if (!result) return null;
  const rows = result.effects.map(e => {
    const indirectSum = e.indirect.reduce((a, b) => a + b.value, 0);
    return [e.variable, fmt(e.direct), fmt(indirectSum), fmt(e.total)];
  });
  return (
    <>
      <Section label="PATH COEFFICIENTS" tableId="path-tbl">
        <DataTable id="path-tbl" head={['Variable', 'Direct Effect', 'Indirect (sum)', 'Total Correlation']} rows={rows} />
      </Section>
      <Section label="RESIDUAL">
        <MetricGrid items={[['Residual Effect', fmt(result.residual, 4)], ['N', String(result.n)]]} />
      </Section>
    </>
  );
};

// ═══ Multiple Comparison Result ═══
export const MulCompResult = ({ result }) => {
  if (!result) return null;
  const rows = result.comparisons.map(c => [c.treatment, fmt(c.mean, 3), c.group]);
  return (
    <>
      <Section label={`MULTIPLE COMPARISON (${result.test})`} tableId="mc-tbl">
        <DataTable id="mc-tbl" head={['Treatment', 'Mean', 'Group']} rows={rows} />
      </Section>
      <Section label="STATISTICS">
        <MetricGrid items={[['LSD', fmt(result.lsd, 3)], ['MSE', fmt(result.mse, 3)], ['df (Error)', String(result.df_error)], ['SE', fmt(result.se, 3)]]} />
      </Section>
    </>
  );
};

// ═══ Stability Result ═══
export const StabilityResult = ({ result }) => {
  if (!result) return null;
  const rows = result.stability.map(s => [s.genotype, fmt(s.mean, 3), fmt(s.bi, 3), fmt(s.s2di, 4), fmt(s.r2, 3)]);
  return (
    <Section label="STABILITY PARAMETERS (EBERHART-RUSSELL)" tableId="stab-tbl">
      <DataTable id="stab-tbl" head={['Genotype', 'Mean', 'bi', 'S²di', 'R²']} rows={rows} />
    </Section>
  );
};

// ═══ Renderer selector ═══
export const getRenderer = (toolId) => {
  const map = {
    onefactor: 'anova', twofactor: 'anova', threefactor: 'anova',
    latin: 'anova', strip: 'anova', pooled: 'anova', splitenv: 'anova',
    augmented: 'anova', lattice: 'anova', pbibd: 'anova',
    diallel: 'anova', partialdial: 'anova', linetester: 'anova',
    genmean: 'anova', ttc: 'anova',
    layouts: 'layout', mulcomp: 'mulcomp',
    frequency: 'frequency', crosstab: 'crosstab', means: 'means',
    correlation: 'correlation', regression: 'regression',
    path: 'path', stability: 'stability',
    pca: 'pca', kmean: 'cluster', probit: 'probit',
  };
  return map[toolId] || 'anova';
};
