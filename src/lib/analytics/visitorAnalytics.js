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

function getTimezoneOffset(date, timezone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const asUtc = Date.UTC(
    Number(values.year), Number(values.month) - 1, Number(values.day),
    Number(values.hour), Number(values.minute), Number(values.second),
  );
  return asUtc - date.getTime();
}

export function getCalendarMonthRange(monthKey, timezone = ANALYTICS_TIMEZONE) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey)) return null;
  const [year, month] = monthKey.split("-").map(Number);
  const toZonedUtc = (targetYear, targetMonth) => {
    const guess = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
    const firstPass = new Date(guess.getTime() - getTimezoneOffset(guess, timezone));
    return new Date(guess.getTime() - getTimezoneOffset(firstPass, timezone));
  };

  return {
    startDate: toZonedUtc(year, month),
    endDate: toZonedUtc(year, month + 1),
    previousStartDate: toZonedUtc(year, month - 1),
  };
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

  // A zero baseline cannot be divided mathematically. For reporting purposes,
  // treat the first month with traffic as full positive growth and an empty
  // month following another empty month as neutral growth.
  return currentValue > 0 ? 100 : 0;
}

export function getUniqueCount(result = []) {
  return result[0]?.count || 0;
}
