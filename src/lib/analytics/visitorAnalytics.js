export const ANALYTICS_TIMEZONE =
  process.env.ANALYTICS_TIMEZONE || "Asia/Karachi";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getAnalyticsPeriod(value, fallback = 30) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 365
    ? parsed
    : null;
}

export function getRollingPeriodRange(periodDays, now = new Date()) {
  const endDate = new Date(now);
  const startDate = new Date(endDate.getTime() - periodDays * DAY_IN_MS);
  const previousStartDate = new Date(startDate.getTime() - periodDays * DAY_IN_MS);

  return { startDate, endDate, previousStartDate };
}

export function getVisitorIdentityExpression() {
  return {
    $cond: [
      {
        $and: [
          { $eq: [{ $type: "$visitorId" }, "string"] },
          { $ne: ["$visitorId", ""] },
        ],
      },
      "$visitorId",
      "$sessionId",
    ],
  };
}

export function getSessionIdentityExpression() {
  return {
    $cond: [
      {
        $and: [
          { $eq: [{ $type: "$sessionId" }, "string"] },
          { $ne: ["$sessionId", ""] },
        ],
      },
      "$sessionId",
      getVisitorIdentityExpression(),
    ],
  };
}

export function addAnalyticsIdentityStage() {
  return {
    $set: {
      analyticsVisitorId: getVisitorIdentityExpression(),
      analyticsSessionId: getSessionIdentityExpression(),
    },
  };
}

export function validVisitorIdentityStage() {
  return {
    $match: {
      analyticsVisitorId: { $type: "string", $ne: "" },
      analyticsSessionId: { $type: "string", $ne: "" },
    },
  };
}

export function calculateGrowthRate(currentValue, previousValue) {
  if (previousValue > 0) {
    return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1));
  }

  return null;
}

export function getUniqueCount(result = []) {
  return result[0]?.count || 0;
}
