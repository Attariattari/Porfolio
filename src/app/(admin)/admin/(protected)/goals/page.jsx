"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Upload,
  Shield,
  Cpu,
  Sparkles,
} from "lucide-react";

export default function GoalsAdminPage() {
  const [activeTab, setActiveTab] = useState("goals"); // goals, roadmap, milestones
  const [goals, setGoals] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showImportPrompt, setShowImportPrompt] = useState(false);
  const [config, setConfig] = useState({
    healthMode: "auto",
    manualHealthScore: 90,
  });
  const [insights, setInsights] = useState({});
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "planned",
    priority: "medium",
    progress: 0,
    targetDate: "",
    featured: false,
    icon: "Target",
    order: 0,
    publishStatus: "published",
  });
  const [progressForm, setProgressForm] = useState({
    title: "",
    description: "",
    category: "Feature",
    publishStatus: "published",
    createdAt: new Date().toISOString().split("T")[0],
  });
  const [editingProgress, setEditingProgress] = useState(null);
  const [editingRoadmap, setEditingRoadmap] = useState(null);
  const [roadmapForm, setRoadmapForm] = useState({
    title: "", description: "", year: new Date().getFullYear(), quarter: "Q1",
    status: "upcoming", publishStatus: "published", order: 0,
  });
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState({
    title: "", description: "", date: "", category: "", featured: false,
    publishStatus: "published", order: 0,
  });
  const [visionForm, setVisionForm] = useState({
    missionStatement: "", visionStatement: "", founderMessage: "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setIsLoading(true);
      const [goalsRes, roadmapRes, milestonesRes, progressRes, visionRes] = await Promise.all([
        fetch("/api/admin/goals"),
        fetch("/api/admin/goals/roadmap"),
        fetch("/api/admin/goals/milestones"),
        fetch("/api/admin/goals/progress"),
        fetch("/api/admin/goals/vision"),
      ]);

      if (goalsRes.ok) {
        const data = await goalsRes.json();
        setGoals(data.data || []);
        // Check if we need to show import prompt
        if (data.data.length === 0 || data.data.every((g) => g._isFromDataJs)) {
          setShowImportPrompt(true);
        }
      }
      if (roadmapRes.ok) {
        const data = await roadmapRes.json();
        setRoadmap(data.data || []);
      }
      if (milestonesRes.ok) {
        const data = await milestonesRes.json();
        setMilestones(data.data || []);
      }
      if (progressRes.ok) {
        const data = await progressRes.json();
        setProgressUpdates(data.data || []);
      }
      if (visionRes.ok) {
        const data = await visionRes.json();
        setVisionForm({
          missionStatement: data.data?.missionStatement || "",
          visionStatement: data.data?.visionStatement || "",
          founderMessage: data.data?.founderMessage || "",
        });
      }

      // Fetch Config & Insights
      const [configRes, insightsRes] = await Promise.all([
        fetch("/api/admin/goals/config"),
        fetch("/api/goals"), // Public data includes current insights
      ]);

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data.data || { healthMode: "auto", manualHealthScore: 90 });
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data.data.insights || {});
      }
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportDefaults = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/goals/import", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        toast.success(
          `Imported ${data.goals || 0} goals, ${data.roadmap || 0} roadmap items, ${data.milestones || 0} milestones`,
        );
        setShowImportPrompt(false);
        fetchData();
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch (error) {
      toast.error("Failed to import data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGoal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      status: "planned",
      priority: "medium",
      progress: 0,
      targetDate: "",
      featured: false,
      icon: "Target",
      order: goals.length,
      publishStatus: "published",
    });
    setIsModalOpen(true);
  };

  const handleSaveGoal = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const isFallback = editingItem?._isFromDataJs;
      const url =
        editingItem && !isFallback
          ? `/api/admin/goals/${editingItem._id}`
          : "/api/admin/goals";
      const method = editingItem && !isFallback ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          editingItem && !isFallback
            ? "Goal updated"
            : "Goal created & migrated",
        );
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save goal");
      console.error(error);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const res = await fetch(`/api/admin/goals/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Goal deleted");
        fetchData();
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete goal");
      console.error(error);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingItem(goal);
    setFormData({
      title: goal.title || "",
      description: goal.description || "",
      category: goal.category || "",
      status: goal.status || "planned",
      priority: goal.priority || "medium",
      progress: goal.progress || 0,
      targetDate: goal.targetDate
        ? new Date(goal.targetDate).toISOString().split("T")[0]
        : "",
      featured: goal.featured || false,
      icon: goal.icon || "Target",
      order: goal.order || 0,
      publishStatus: goal.publishStatus || "published",
    });
    setIsModalOpen(true);
  };

  const handleUpdateConfig = async (newData) => {
    try {
      setIsUpdatingConfig(true);
      const res = await fetch("/api/admin/goals/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        toast.success("Strategy configuration updated");
      }
    } catch (error) {
      toast.error("Failed to update configuration");
    } finally {
      setIsUpdatingConfig(false);
    }
  }

  const resetProgressForm = () => {
    setEditingProgress(null);
    setProgressForm({
      title: "",
      description: "",
      category: "Feature",
      publishStatus: "published",
      createdAt: new Date().toISOString().split("T")[0],
    });
  };

  const handleSaveProgress = async () => {
    if (!progressForm.title.trim()) {
      toast.error("Progress title is required");
      return;
    }

    try {
      const isFallback = editingProgress?._isFromDataJs;
      const url =
        editingProgress && !isFallback
          ? `/api/admin/goals/progress/${editingProgress._id}`
          : "/api/admin/goals/progress";
      const method = editingProgress && !isFallback ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progressForm),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editingProgress && !isFallback ? "Progress updated" : "Progress added");
        resetProgressForm();
        fetchData();
      } else {
        toast.error(data.error || "Failed to save progress");
      }
    } catch (error) {
      toast.error("Failed to save progress");
      console.error(error);
    }
  };

  const handleEditProgress = (item) => {
    setEditingProgress(item);
    setProgressForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "Feature",
      publishStatus: item.publishStatus || "published",
      createdAt: item.createdAt
        ? new Date(item.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setActiveTab("progress");
  };

  const handleDeleteProgress = async (id) => {
    if (!confirm("Delete this progress update?")) return;

    try {
      const res = await fetch(`/api/admin/goals/progress/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Progress deleted");
        fetchData();
      } else {
        toast.error(data.error || "Failed to delete progress");
      }
    } catch (error) {
      toast.error("Failed to delete progress");
      console.error(error);
    }
  };

  const handleRegenerateInsights = async () => {
    try {
      setIsUpdatingConfig(true);
      const res = await fetch("/api/admin/goals/insights/regenerate", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setInsights(data.data);
        toast.success("Strategic insights regenerated");
      }
    } catch (error) {
      toast.error("Generation failed");
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  const saveManagedItem = async ({ type, editing, payload, reset }) => {
    if (!payload.title?.trim()) return toast.error("Title is required");
    const base = `/api/admin/goals/${type}`;
    const response = await fetch(editing?._id ? `${base}/${editing._id}` : base, {
      method: editing?._id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      return toast.error(result.error || `Failed to save ${type}`);
    }
    toast.success(`${type === "roadmap" ? "Roadmap item" : "Milestone"} saved`);
    reset();
    await fetchData();
  };

  const deleteManagedItem = async (type, id) => {
    if (!confirm(`Delete this ${type === "roadmap" ? "roadmap item" : "milestone"}?`)) return;
    const response = await fetch(`/api/admin/goals/${type}/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok || !result.success) return toast.error(result.error || "Delete failed");
    toast.success("Item deleted");
    await fetchData();
  };

  const saveVision = async () => {
    const response = await fetch("/api/admin/goals/vision", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visionForm),
    });
    const result = await response.json();
    if (!response.ok || !result.success) return toast.error(result.error || "Vision update failed");
    setVisionForm({
      missionStatement: result.data?.missionStatement || "",
      visionStatement: result.data?.visionStatement || "",
      founderMessage: result.data?.founderMessage || "",
    });
    toast.success("Vision content updated");
  };

  // Stats calculation
  const stats = {
    totalGoals: goals.filter((g) => !g._isFromDataJs).length,
    activeGoals: goals.filter(
      (g) => !g._isFromDataJs && g.status === "in-progress",
    ).length,
    completedGoals: goals.filter(
      (g) => !g._isFromDataJs && g.status === "completed",
    ).length,
    roadmapItems: roadmap.filter((r) => !r._isFromDataJs).length,
    milestoneItems: milestones.filter((m) => !m._isFromDataJs).length,
  };

  const dbGoals = goals.filter((g) => !g._isFromDataJs);
  const dbRoadmap = roadmap.filter((r) => !r._isFromDataJs);
  const dbMilestones = milestones.filter((m) => !m._isFromDataJs);
  const dbProgressUpdates = progressUpdates.filter((p) => !p._isFromDataJs);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Goals Management</h1>
          <p className="text-foreground/60">
            Manage strategic goals, roadmap, and milestones
          </p>
        </div>

        {/* Import Prompt */}
        {showImportPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-accent/20 border border-accent/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <h3 className="font-semibold text-accent mb-1">
                    No Goals Found
                  </h3>
                  <p className="text-sm text-accent">
                    Would you like to import default goals data from the
                    template?
                  </p>
                </div>
              </div>
              <button
                onClick={handleImportDefaults}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-accent text-foreground font-semibold hover:bg-accent disabled:opacity-50"
              >
                {isLoading ? "Importing..." : "Import Now"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Goals", value: stats.totalGoals, icon: Target },
            {
              label: "Active Goals",
              value: stats.activeGoals,
              icon: TrendingUp,
            },
            {
              label: "Completed",
              value: stats.completedGoals,
              icon: CheckCircle2,
            },
            {
              label: "Roadmap Items",
              value: stats.roadmapItems,
              icon: Calendar,
            },
            { label: "Milestones", value: stats.milestoneItems, icon: Target },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-muted border border-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className="w-6 h-6 text-accent/60" />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border overflow-x-auto">
          {["goals", "roadmap", "milestones", "progress", "strategic-deck"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "text-accent border-b-2 border-accent"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {tab
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-foreground/60">Loading...</p>
          </div>
        ) : (
          <>
            {/* Goals Tab */}
            {activeTab === "goals" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Strategic Goals</h2>
                  <button
                    onClick={handleAddGoal}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90"
                  >
                    <Plus className="w-4 h-4" />
                    Add Goal
                  </button>
                </div>

                {dbGoals.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-foreground/40 mx-auto mb-3" />
                    <p className="text-foreground/60">No goals created yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dbGoals.map((goal) => (
                      <div
                        key={goal._id}
                        className="p-4 rounded-lg bg-muted border border-border hover:border-border transition-all flex items-start justify-between"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {goal.title}
                          </h3>
                          <p className="text-sm text-foreground/60 mt-1">
                            {goal.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">
                              {goal.status}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">
                              {goal.priority}
                            </span>
                            {goal.featured && (
                              <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-foreground/60">
                            Progress: {goal.progress}% | Category:{" "}
                            {goal.category}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditGoal(goal)}
                            className="p-2 hover:bg-muted rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-foreground/60" />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal._id)}
                            className="p-2 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Roadmap Tab */}
            {activeTab === "roadmap" && (
              <div>
                <div className="mb-8 rounded-2xl border border-border bg-muted/50 p-6">
                  <h2 className="text-2xl font-bold mb-5">{editingRoadmap ? "Edit Roadmap Item" : "Add Roadmap Item"}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={roadmapForm.title} onChange={(e) => setRoadmapForm({ ...roadmapForm, title: e.target.value })} placeholder="Roadmap title" className="rounded-xl border border-border bg-background p-3" />
                    <input type="number" value={roadmapForm.year} onChange={(e) => setRoadmapForm({ ...roadmapForm, year: Number(e.target.value) })} className="rounded-xl border border-border bg-background p-3" />
                    <textarea value={roadmapForm.description} onChange={(e) => setRoadmapForm({ ...roadmapForm, description: e.target.value })} placeholder="Description" className="md:col-span-2 rounded-xl border border-border bg-background p-3" />
                    <select value={roadmapForm.quarter} onChange={(e) => setRoadmapForm({ ...roadmapForm, quarter: e.target.value })} className="rounded-xl border border-border bg-background p-3"><option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option></select>
                    <select value={roadmapForm.status} onChange={(e) => setRoadmapForm({ ...roadmapForm, status: e.target.value })} className="rounded-xl border border-border bg-background p-3"><option value="upcoming">Upcoming</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="delayed">Delayed</option></select>
                    <select value={roadmapForm.publishStatus} onChange={(e) => setRoadmapForm({ ...roadmapForm, publishStatus: e.target.value })} className="rounded-xl border border-border bg-background p-3"><option value="published">Published</option><option value="draft">Draft</option></select>
                    <input type="number" value={roadmapForm.order} onChange={(e) => setRoadmapForm({ ...roadmapForm, order: Number(e.target.value) })} placeholder="Display order" className="rounded-xl border border-border bg-background p-3" />
                    <div className="flex gap-3">
                      <button onClick={() => saveManagedItem({ type: "roadmap", editing: editingRoadmap, payload: roadmapForm, reset: () => { setEditingRoadmap(null); setRoadmapForm({ title: "", description: "", year: new Date().getFullYear(), quarter: "Q1", status: "upcoming", publishStatus: "published", order: 0 }); } })} className="rounded-xl bg-accent px-5 py-3 font-bold text-foreground">Save Roadmap</button>
                      {editingRoadmap && <button onClick={() => { setEditingRoadmap(null); setRoadmapForm({ title: "", description: "", year: new Date().getFullYear(), quarter: "Q1", status: "upcoming", publishStatus: "published", order: 0 }); }} className="rounded-xl border border-border px-5 py-3">Cancel</button>}
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-6">Roadmap Items</h2>
                {dbRoadmap.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-foreground/40 mx-auto mb-3" />
                    <p className="text-foreground/60">
                      No roadmap items created yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dbRoadmap.map((item) => (
                      <div
                        key={item._id}
                        className="p-4 rounded-lg bg-muted border border-border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">
                              {item.title}
                            </h3>
                            <p className="text-sm text-foreground/60 mt-1">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">
                                {item.year} {item.quarter}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">
                                {item.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingRoadmap(item); setRoadmapForm({ title: item.title || "", description: item.description || "", year: item.year || new Date().getFullYear(), quarter: item.quarter || "Q1", status: item.status || "upcoming", publishStatus: item.publishStatus || "published", order: item.order || 0 }); }} className="p-2 rounded-lg border border-border" aria-label="Edit roadmap item"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteManagedItem("roadmap", item._id)} className="p-2 rounded-lg border border-red-500/20 text-red-400" aria-label="Delete roadmap item"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Milestones Tab */}
            {activeTab === "milestones" && (
              <div>
                <div className="mb-8 rounded-2xl border border-border bg-muted/50 p-6">
                  <h2 className="text-2xl font-bold mb-5">{editingMilestone ? "Edit Milestone" : "Add Milestone"}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} placeholder="Milestone title" className="rounded-xl border border-border bg-background p-3" />
                    <input type="date" value={milestoneForm.date} onChange={(e) => setMilestoneForm({ ...milestoneForm, date: e.target.value })} className="rounded-xl border border-border bg-background p-3" />
                    <textarea value={milestoneForm.description} onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} placeholder="Description" className="md:col-span-2 rounded-xl border border-border bg-background p-3" />
                    <input value={milestoneForm.category} onChange={(e) => setMilestoneForm({ ...milestoneForm, category: e.target.value })} placeholder="Category" className="rounded-xl border border-border bg-background p-3" />
                    <select value={milestoneForm.publishStatus} onChange={(e) => setMilestoneForm({ ...milestoneForm, publishStatus: e.target.value })} className="rounded-xl border border-border bg-background p-3"><option value="published">Published</option><option value="draft">Draft</option></select>
                    <input type="number" value={milestoneForm.order} onChange={(e) => setMilestoneForm({ ...milestoneForm, order: Number(e.target.value) })} placeholder="Display order" className="rounded-xl border border-border bg-background p-3" />
                    <label className="flex items-center gap-3 rounded-xl border border-border p-3"><input type="checkbox" checked={milestoneForm.featured} onChange={(e) => setMilestoneForm({ ...milestoneForm, featured: e.target.checked })} /> Featured milestone</label>
                    <div className="flex gap-3">
                      <button onClick={() => saveManagedItem({ type: "milestones", editing: editingMilestone, payload: milestoneForm, reset: () => { setEditingMilestone(null); setMilestoneForm({ title: "", description: "", date: "", category: "", featured: false, publishStatus: "published", order: 0 }); } })} className="rounded-xl bg-accent px-5 py-3 font-bold text-foreground">Save Milestone</button>
                      {editingMilestone && <button onClick={() => { setEditingMilestone(null); setMilestoneForm({ title: "", description: "", date: "", category: "", featured: false, publishStatus: "published", order: 0 }); }} className="rounded-xl border border-border px-5 py-3">Cancel</button>}
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-6">Milestones</h2>
                {dbMilestones.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-foreground/40 mx-auto mb-3" />
                    <p className="text-foreground/60">
                      No milestones created yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dbMilestones.map((milestone) => (
                      <div
                        key={milestone._id}
                        className="p-4 rounded-lg bg-muted border border-border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">
                              {milestone.title}
                            </h3>
                            <p className="text-sm text-foreground/60 mt-1">
                              {milestone.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-foreground/60">
                                {new Date(milestone.date).toLocaleDateString()}
                              </span>
                              {milestone.featured && (
                                <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingMilestone(milestone); setMilestoneForm({ title: milestone.title || "", description: milestone.description || "", date: milestone.date ? new Date(milestone.date).toISOString().split("T")[0] : "", category: milestone.category || "", featured: Boolean(milestone.featured), publishStatus: milestone.publishStatus || "published", order: milestone.order || 0 }); }} className="p-2 rounded-lg border border-border" aria-label="Edit milestone"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteManagedItem("milestones", milestone._id)} className="p-2 rounded-lg border border-red-500/20 text-red-400" aria-label="Delete milestone"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recent Progress Tab */}
            {activeTab === "progress" && (
              <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8">
                <div className="p-6 rounded-2xl bg-muted/50 border border-border h-fit">
                  <h2 className="text-2xl font-bold mb-2">
                    {editingProgress ? "Edit Progress" : "Add Progress"}
                  </h2>
                  <p className="text-sm text-foreground/60 mb-6">
                    Add real design, feature, content, or roadmap updates shown on the public Goals page.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={progressForm.title}
                        onChange={(e) =>
                          setProgressForm({
                            ...progressForm,
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g., Updated Goals page design"
                        className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Description
                      </label>
                      <textarea
                        value={progressForm.description}
                        onChange={(e) =>
                          setProgressForm({
                            ...progressForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Short public note about what changed"
                        className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground h-24"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Type
                        </label>
                        <select
                          value={progressForm.category}
                          onChange={(e) =>
                            setProgressForm({
                              ...progressForm,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground"
                        >
                          <option value="Feature">Feature</option>
                          <option value="Design">Design</option>
                          <option value="Content">Content</option>
                          <option value="Roadmap">Roadmap</option>
                          <option value="Fix">Fix</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Visibility
                        </label>
                        <select
                          value={progressForm.publishStatus}
                          onChange={(e) =>
                            setProgressForm({
                              ...progressForm,
                              publishStatus: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={progressForm.createdAt}
                        onChange={(e) =>
                          setProgressForm({
                            ...progressForm,
                            createdAt: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveProgress}
                        className="flex-1 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90"
                      >
                        {editingProgress ? "Update Progress" : "Add Progress"}
                      </button>
                      {editingProgress && (
                        <button
                          onClick={resetProgressForm}
                          className="px-4 py-2 rounded-lg bg-muted border border-border text-foreground font-semibold hover:bg-muted"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    Recent Progress Updates
                  </h2>
                  {dbProgressUpdates.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl bg-muted/50 border border-border">
                      <CheckCircle2 className="w-12 h-12 text-foreground/40 mx-auto mb-3" />
                      <p className="text-foreground/60">
                        No manual progress updates yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dbProgressUpdates.map((item) => (
                        <div
                          key={item._id}
                          className="p-4 rounded-lg bg-muted border border-border hover:border-border transition-all flex items-start justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">
                                {item.title}
                              </h3>
                              <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">
                                {item.category}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-muted text-foreground/70">
                                {item.publishStatus}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-foreground/60">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-2 text-xs text-foreground/40">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString()
                                : "No date"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditProgress(item)}
                              className="p-2 hover:bg-muted rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-foreground/60" />
                            </button>
                            <button
                              onClick={() => handleDeleteProgress(item._id)}
                              className="p-2 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Strategic Deck Tab */}
            {activeTab === "strategic-deck" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2 p-8 rounded-2xl bg-muted/50 border border-border space-y-5">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-3 mb-2"><Target className="w-5 h-5 text-accent" />Public Vision Content</h3>
                    <p className="text-sm text-foreground/60">Edit the mission, vision, and founder message shown on the public Goals page.</p>
                  </div>
                  <textarea value={visionForm.missionStatement} onChange={(e) => setVisionForm({ ...visionForm, missionStatement: e.target.value })} placeholder="Mission statement" className="w-full min-h-24 rounded-xl border border-border bg-background p-4" />
                  <textarea value={visionForm.visionStatement} onChange={(e) => setVisionForm({ ...visionForm, visionStatement: e.target.value })} placeholder="Vision statement" className="w-full min-h-24 rounded-xl border border-border bg-background p-4" />
                  <textarea value={visionForm.founderMessage} onChange={(e) => setVisionForm({ ...visionForm, founderMessage: e.target.value })} placeholder="Founder message" className="w-full min-h-24 rounded-xl border border-border bg-background p-4" />
                  <button onClick={saveVision} className="rounded-xl bg-accent px-6 py-3 font-bold text-foreground">Save Vision Content</button>
                </div>
                {/* 1. HEALTH CONFIG */}
                <div className="p-8 rounded-2xl bg-muted/50 border border-border space-y-8">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-accent" />
                      Studio Health Strategy
                    </h3>
                    <p className="text-sm text-foreground/60 italic">
                      Define how Muhyo Tech&apos;s overall health score is determined.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div>
                        <div className="font-bold">Health Mode</div>
                        <div className="text-xs text-foreground/40 uppercase font-black mt-0.5 tracking-widest">
                          Auto vs Manual Override
                        </div>
                      </div>
                      <div className="flex bg-background p-1 rounded-lg border border-border">
                        <button
                          onClick={() =>
                            handleUpdateConfig({
                              ...config,
                              healthMode: "auto",
                            })
                          }
                          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${config.healthMode === "auto" ? "bg-accent text-foreground" : "text-foreground/40 hover:text-foreground"}`}
                        >
                          Auto
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateConfig({
                              ...config,
                              healthMode: "manual",
                            })
                          }
                          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${config.healthMode === "manual" ? "bg-accent text-foreground" : "text-foreground/40 hover:text-foreground"}`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>

                    {config.healthMode === "manual" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 p-4 rounded-xl bg-accent/5 border border-accent/20"
                      >
                        <label className="text-sm font-bold block mb-2 uppercase tracking-widest text-accent">
                          Manual Health Score
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={config.manualHealthScore}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                manualHealthScore: parseInt(e.target.value),
                              })
                            }
                            onMouseUp={() =>
                              handleUpdateConfig({
                                ...config,
                                manualHealthScore: config.manualHealthScore,
                              })
                            }
                            className="flex-grow h-2 bg-background rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                          <span className="text-xl font-black text-accent">
                            {config.manualHealthScore}%
                          </span>
                        </div>
                      </motion.div>
                    )}

                    <div className="p-4 rounded-xl bg-muted/50 border border-dashed border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-4 h-4 text-accent/60" />
                        <span className="text-xs font-black uppercase tracking-widest text-foreground/60">
                          Auto-Metrics Logic
                        </span>
                      </div>
                      <ul className="space-y-2">
                        <li className="text-[11px] flex justify-between">
                          <span className="text-foreground/40">
                            Goal Completion (Weight 70%)
                          </span>
                          <span className="text-accent font-bold">ACTIVE</span>
                        </li>
                        <li className="text-[11px] flex justify-between">
                          <span className="text-foreground/40">
                            Blog Consistency (Weight 30%)
                          </span>
                          <span className="text-accent font-bold">ACTIVE</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 2. AI INSIGHTS ENGINE */}
                <div className="p-8 rounded-2xl bg-muted/50 border border-border space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-3 mb-2">
                        <Cpu className="w-5 h-5 text-accent" />
                        Insight Engine
                      </h3>
                      <p className="text-sm text-foreground/60 italic">
                        Strategic patterns identified by the AI analyzer.
                      </p>
                    </div>
                    <button
                      onClick={handleRegenerateInsights}
                      disabled={isUpdatingConfig}
                      className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-foreground transition-all disabled:opacity-50 group"
                      title="Regenerate Insights"
                    >
                      <Sparkles
                        className={`w-5 h-5 ${isUpdatingConfig ? "animate-spin" : "group-hover:animate-pulse"}`}
                      />
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.keys(insights).length > 0 ? (
                      Object.entries(insights).map(([key, item], idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-muted/50 border border-border hover:border-accent/20 transition-all"
                        >
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-1">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </div>
                          <div className="text-sm font-bold text-foreground">
                            {typeof item === "object"
                              ? item?.title || JSON.stringify(item)
                              : item}
                          </div>
                          {item?.progress !== undefined && (
                            <div className="mt-2 h-1 w-full bg-background rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 italic text-foreground/40">
                        No insights generated yet.
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border flex justify-center text-[10px] font-bold text-foreground/30 uppercase tracking-[0.3em]">
                    Next Regeneration:{" "}
                    {new Date(
                      new Date().getTime() + 24 * 60 * 60 * 1000,
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-overlay/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background border border-border rounded-lg p-6 max-w-lg w-full max-h-96 overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-4">
                {editingItem ? "Edit Goal" : "Add Goal"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground"
                    >
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        progress: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Technology"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Target Date</label>
                    <input type="date" value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Publication</label>
                    <select value={formData.publishStatus} onChange={(e) => setFormData({ ...formData, publishStatus: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground"><option value="published">Published</option><option value="draft">Draft</option></select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Icon</label>
                    <input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Order</label>
                    <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-semibold">
                    Mark as Featured
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveGoal}
                    className="flex-1 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-muted border border-border text-foreground font-semibold hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
