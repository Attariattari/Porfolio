/**
 * Search Data Normalizer (Phase 5)
 * 
 * Normalizes raw Google Search Console API rows or third-party responses 
 * into a standardized internal Search Signal object model.
 */

export function normalizeGscRow(row = {}, dateRange = {}) {
  const keys = Array.isArray(row.keys) ? row.keys : [];
  const query = String(keys[0] || "").trim();
  const page = String(keys[1] || "").trim();
  const clicks = Math.max(0, Number(row.clicks) || 0);
  const impressions = Math.max(0, Number(row.impressions) || 0);
  
  // Calculate CTR as 0-100 percentage
  const rawCtr = typeof row.ctr === "number" ? row.ctr * (row.ctr <= 1 ? 100 : 1) : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : rawCtr;
  const averagePosition = Math.max(0, Math.round((Number(row.position) || 0) * 10) / 10);

  return {
    query,
    page,
    clicks,
    impressions,
    ctr: Math.min(100, Math.max(0, Math.round(ctr * 100) / 100)),
    averagePosition,
    country: "global",
    device: "all",
    dateRange: {
      startDate: dateRange.startDate || null,
      endDate: dateRange.endDate || null,
    },
    source: "gsc_api",
    collectedAt: new Date().toISOString(),
  };
}

export function normalizeGscDataset(rows = [], dateRange = {}) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => normalizeGscRow(row, dateRange))
    .filter((record) => record.query.length > 0);
}
