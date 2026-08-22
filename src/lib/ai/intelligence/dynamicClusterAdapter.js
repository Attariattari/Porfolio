/**
 * Dynamic Cluster Adapter & Queue Orchestration (Phase 6)
 * 
 * Adapts topic selection logic to support variable cluster depth (0 to 6+ supporting topics).
 * Replaces rigid fixed assumptions (has(1) && has(2)) while maintaining 100% backward 
 * compatibility for legacy topic plans.
 * 
 * Includes Shadow Mode support (THINK10X_DYNAMIC_CLUSTER_MODE="SHADOW").
 */

export function getClusterEngineMode() {
  const mode = String(process.env.THINK10X_DYNAMIC_CLUSTER_MODE || "ACTIVE").toUpperCase();
  return ["OFF", "SHADOW", "ASSIST", "ACTIVE"].includes(mode) ? mode : "ACTIVE";
}

export function evaluateDynamicClusterProgress(pillarPlan = {}, childTopics = [], parentBlog = null) {
  // Determine desired supporting count (legacy records default to 2)
  const desiredCount = typeof pillarPlan.desiredSupportingCount === "number"
    ? pillarPlan.desiredSupportingCount
    : 2;

  const usedChildren = childTopics.filter((c) => c.status === "used");
  const readyChildren = childTopics.filter((c) => c.status === "ready");
  const failedChildren = childTopics.filter((c) => c.status === "failed" || c.status === "rejected");

  const usedCount = usedChildren.length;
  const isClusterComplete = usedCount >= desiredCount || (readyChildren.length === 0 && usedCount > 0);

  const usedOrders = new Set(usedChildren.map((c) => c.clusterOrder));
  
  // Find next available clusterOrder from ready children
  let nextReadyChild = null;
  for (const child of readyChildren) {
    if (!usedOrders.has(child.clusterOrder)) {
      nextReadyChild = child;
      break;
    }
  }

  const mode = getClusterEngineMode();

  if (mode === "SHADOW") {
    console.log(`[DynamicClusterAdapter:SHADOW] Pillar="${pillarPlan.title}" desiredCount=${desiredCount} usedCount=${usedCount} isComplete=${isClusterComplete} nextReadyChild=${nextReadyChild?.title || "none"}`);
  }

  return {
    desiredCount,
    usedCount,
    readyCount: readyChildren.length,
    failedCount: failedChildren.length,
    isClusterComplete,
    nextReadyChild,
    parentBlog,
  };
}
