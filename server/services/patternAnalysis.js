/**
 * AI-style pattern analysis on report data: trends, hotspots, categories.
 */
const db = require('../db');

function extractKeywords(text) {
  if (!text || typeof text !== 'string') return [];
  const stop = new Set('the a an is are was were be been being have has had do does did will would could should may might must can and or but in on at to for of with by'.split(' '));
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const filtered = words.filter(w => w.length > 2 && !stop.has(w));
  const counts = {};
  filtered.forEach(w => { counts[w] = (counts[w] || 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

function runPatternAnalysis() {
  const reports = db.prepare(`
    SELECT r.id, r.content_text, r.transcribed_text, r.severity, r.created_at,
           m.location_place, m.location_campus, m.category, m.keywords
    FROM reports r
    LEFT JOIN report_metadata m ON m.report_id = r.id
    ORDER BY r.created_at DESC
  `).all();

  const bySeverity = {};
  const byLocation = {};
  const byCategory = {};
  const byMonth = {};
  const allText = [];

  reports.forEach(r => {
    const text = (r.content_text || r.transcribed_text || '').trim();
    if (text) allText.push(text);

    const sev = r.severity || 'unknown';
    bySeverity[sev] = (bySeverity[sev] || 0) + 1;

    const loc = r.location_place || r.location_campus || 'Unspecified';
    byLocation[loc] = (byLocation[loc] || 0) + 1;

    const cat = r.category || 'Uncategorized';
    byCategory[cat] = (byCategory[cat] || 0) + 1;

    const month = (r.created_at || '').slice(0, 7);
    if (month) byMonth[month] = (byMonth[month] || 0) + 1;
  });

  const combinedText = allText.join(' ');
  const topKeywords = extractKeywords(combinedText);

  const summary = {
    totalReports: reports.length,
    bySeverity,
    byLocation,
    byCategory,
    byMonth,
    topKeywords,
    highSeverityCount: (bySeverity.high || 0) + (bySeverity.critical || 0)
  };

  const insights = [];
  if (summary.highSeverityCount > 0) {
    insights.push(`${summary.highSeverityCount} report(s) classified as high or critical severity. Review accommodation needs.`);
  }
  const topLoc = Object.entries(byLocation).sort((a, b) => b[1] - a[1])[0];
  if (topLoc) insights.push(`Most reported location: "${topLoc[0]}" (${topLoc[1]} reports).`);
  const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  if (topCat) insights.push(`Most common category: "${topCat[0]}" (${topCat[1]} reports).`);

  const stmt = db.prepare(`
    INSERT INTO pattern_analysis (analysis_type, summary, insights, data_snapshot)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run('full', JSON.stringify(summary), insights.join(' '), JSON.stringify(summary));

  return { summary, insights };
}

function getCrossReferences(reportId) {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
  if (!report) return null;

  const meta = db.prepare('SELECT * FROM report_metadata WHERE report_id = ?').get(reportId);
  const location = meta?.location_place || meta?.location_campus;
  const category = meta?.category;

  let related = [];
  if (location || category) {
    const rel = db.prepare(`
      SELECT r.id, r.severity, r.created_at, m.location_place, m.category
      FROM reports r
      LEFT JOIN report_metadata m ON m.report_id = r.id
      WHERE r.id != ? AND (m.location_place = ? OR m.location_campus = ? OR m.category = ?)
      ORDER BY r.created_at DESC
      LIMIT 10
    `).all(reportId, location || null, location || null, category || null);
    related = rel;
  }

  return { report, metadata: meta, relatedReports: related };
}

module.exports = { runPatternAnalysis, getCrossReferences, extractKeywords };
