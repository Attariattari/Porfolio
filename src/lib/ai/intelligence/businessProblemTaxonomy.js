/**
 * Business Problem Taxonomy Engine (Phase 4)
 * 
 * Maps commercial and industry topic candidates to outcome-oriented business problems.
 * Business problems MUST describe an actual business challenge or outcome (e.g. "lead_generation"),
 * NOT a technical implementation detail (e.g. "React component optimization").
 */

export const BUSINESS_PROBLEM_TAXONOMY = Object.freeze({
  lead_generation: {
    label: "Weak Lead Generation & Pipeline",
    keywords: [/lead/i, /prospect/i, /inquiry/i, /quote request/i, /client acquisition/i],
  },
  poor_conversion: {
    label: "Low Website Conversion Rates",
    keywords: [/conversion/i, /bounce rate/i, /cart abandonment/i, /drop-?off/i, /sales flow/i],
  },
  booking_management: {
    label: "Manual Booking & Appointment Bottlenecks",
    keywords: [/booking/i, /reservation/i, /appointment/i, /scheduling/i, /calendar/i],
  },
  manual_operations: {
    label: "High Manual Operational Workload",
    keywords: [/manual/i, /overhead/i, /data entry/i, /redundant/i, /inefficient/i, /repetitive/i],
  },
  poor_customer_experience: {
    label: "Subpar Digital Customer Experience",
    keywords: [/customer experience/i, /user friction/i, /usability/i, /client trust/i, /navigation/i],
  },
  slow_business_workflows: {
    label: "Slow & Disjointed Internal Workflows",
    keywords: [/workflow/i, /process delay/i, /turnaround time/i, /approval chain/i, /bottleneck/i],
  },
  inventory_management: {
    label: "Complex Inventory & Catalog Tracking",
    keywords: [/inventory/i, /stock/i, /catalog/i, /sku/i, /order tracking/i, /warehouse/i],
  },
  payment_friction: {
    label: "Payment Processing & Billing Friction",
    keywords: [/payment/i, /billing/i, /checkout friction/i, /invoice/i, /subscription failure/i],
  },
  budget_planning: {
    label: "Unpredictable Project Cost & Scope Estimation",
    keywords: [/budget/i, /cost/i, /pricing/i, /project scope/i, /financial planning/i],
  },
  content_management: {
    label: "Rigid & Slow Content Management",
    keywords: [/content update/i, /cms/i, /publishing delay/i, /editing/i, /marketing agility/i],
  },
  reporting_automation: {
    label: "Lack of Automated Business Reporting",
    keywords: [/reporting/i, /analytics/i, /metrics/i, /kpi/i, /dashboard insights/i],
  },
  customer_portal: {
    label: "Inconvenient Customer Self-Service",
    keywords: [/portal/i, /self-service/i, /client portal/i, /account management/i],
  },
  scalability: {
    label: "Operational Bottlenecks from Platform Scalability",
    keywords: [/scalability/i, /growth limits/i, /traffic spike/i, /system overload/i, /expanding team/i],
  },
  security_risk: {
    label: "Data Security & Compliance Risks",
    keywords: [/security/i, /compliance/i, /privacy/i, /data risk/i, /audit/i, /vulnerability/i],
  },
});

export function getBusinessProblemDefinition(key) {
  if (!key || typeof key !== "string") return null;
  const cleanKey = key.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (BUSINESS_PROBLEM_TAXONOMY[cleanKey]) {
    return { key: cleanKey, label: BUSINESS_PROBLEM_TAXONOMY[cleanKey].label };
  }
  return null;
}

export function detectBusinessProblem(topic = {}) {
  const text = [topic.title, topic.subtopic, topic.problem, topic.businessProblem, topic.businessValue, topic.focusKeyword]
    .filter(Boolean)
    .join(" ");

  for (const [key, def] of Object.entries(BUSINESS_PROBLEM_TAXONOMY)) {
    if (def.keywords.some((pattern) => pattern.test(text))) {
      return { key, label: def.label };
    }
  }

  // Pure technical problems return null
  return null;
}

export function normalizeBusinessProblem(input) {
  if (!input) return null;
  if (typeof input === "object" && input.key) {
    const def = getBusinessProblemDefinition(input.key);
    if (def) return def;
    return { key: String(input.key).trim().toLowerCase(), label: String(input.label || input.key).trim() };
  }
  if (typeof input === "string") {
    const def = getBusinessProblemDefinition(input);
    if (def) return def;
  }
  return null;
}
