/**
 * Closed-Loop Performance Feedback Adapter (Phase 10)
 * 
 * Integrates measured historical performance feedback signals into the Think10X 
 * opportunity scoring engine without replacing or breaking existing scoring logic.
 */

export function computeHistoricalPerformanceSignal(topic = {}, performanceHistory = []) {
  if (!Array.isArray(performanceHistory) || performanceHistory.length === 0) {
    return {
      signalScore: 50,
      confidence: 0.5,
      reason: "No historical performance records available; using baseline 50 score.",
      isEstimated: true,
    };
  }

  // Calculate cluster performance average
  const totalClicks = performanceHistory.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const totalImpressions = performanceHistory.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
  const avgPosition = performanceHistory.reduce((acc, curr) => acc + (curr.averagePosition || 50), 0) / performanceHistory.length;

  let signalScore = 50;
  if (totalClicks >= 100 || avgPosition <= 10) {
    signalScore = 85;
  } else if (totalImpressions >= 1000) {
    signalScore = 75;
  } else if (avgPosition > 40) {
    signalScore = 40;
  }

  return {
    signalScore,
    confidence: 0.9,
    reason: `Cluster historical average position ${avgPosition.toFixed(1)}, total ${totalClicks} clicks, ${totalImpressions} impressions.`,
    isEstimated: false,
  };
}
