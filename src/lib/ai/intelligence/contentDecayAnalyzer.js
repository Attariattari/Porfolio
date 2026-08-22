/**
 * Content Decay & Ranking Loss Analyzer (Phase 10)
 * 
 * Compares 28-day performance periods to detect meaningful traffic or impression decay.
 * Generates diagnostic decay reports without auto-rewriting or modifying articles directly.
 */

import { evaluateContentMaturity } from "./performanceMaturityEngine.js";

export function detectContentDecay(blog = {}, currentPeriod = {}, previousPeriod = {}) {
  const maturity = evaluateContentMaturity(blog.publishedAt || blog.createdAt);

  if (maturity.daysOld < 30) {
    return {
      hasDecay: false,
      reason: "Article is less than 30 days old; insufficient history for decay evaluation.",
    };
  }

  const prevImpressions = previousPeriod.impressions || 0;
  const currImpressions = currentPeriod.impressions || 0;
  const prevClicks = previousPeriod.clicks || 0;
  const currClicks = currentPeriod.clicks || 0;

  if (prevImpressions < 200 && prevClicks < 10) {
    return {
      hasDecay: false,
      reason: "Previous period volume too low for decay significance.",
    };
  }

  const impressionDropRatio = prevImpressions > 0 ? (prevImpressions - currImpressions) / prevImpressions : 0;
  const clickDropRatio = prevClicks > 0 ? (prevClicks - currClicks) / prevClicks : 0;

  if (impressionDropRatio >= 0.30 || clickDropRatio >= 0.35) {
    let cause = "ranking_loss";
    if (impressionDropRatio < 0.15 && clickDropRatio >= 0.35) {
      cause = "ctr_decay";
    }

    return {
      hasDecay: true,
      impressionDropPercent: Math.round(impressionDropRatio * 100),
      clickDropPercent: Math.round(clickDropRatio * 100),
      probableCause: cause,
      recommendation: "REFRESH_DECAYING_CONTENT",
      confidence: 0.88,
      reason: `Detected ${Math.round(impressionDropRatio * 100)}% drop in impressions over 28-day period (${prevImpressions} -> ${currImpressions}).`,
    };
  }

  return {
    hasDecay: false,
    reason: "Performance stable; no significant decay detected.",
  };
}
