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
  });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [goalsRes, roadmapRes, milestonesRes] = await Promise.all([
        fetch("/api/admin/goals"),
        fetch("/api/admin/goals/roadmap"),
        fetch("/api/admin/goals/milestones"),
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
          `Imported ${data.imported.goalsCount} goals, ${data.imported.roadmapCount} roadmap items, ${data.imported.milestonesCount} milestones`,
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
            className="mb-6 p-4 rounded-lg bg-blue-500/20 border border-blue-500/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">
                    No Goals Found
                  </h3>
                  <p className="text-sm text-blue-300">
                    Would you like to import default goals data from the
                    template?
                  </p>
                </div>
              </div>
              <button
                onClick={handleImportDefaults}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50"
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
              className="p-4 rounded-lg bg-white/10 border border-white/20"
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
        <div className="flex gap-4 mb-6 border-b border-white/10 overflow-x-auto">
          {["goals", "roadmap", "milestones", "strategic-deck"].map((tab) => (
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
                        className="p-4 rounded-lg bg-white/10 border border-white/20 hover:border-white/40 transition-all flex items-start justify-between"
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
                            <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
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
                            className="p-2 hover:bg-white/10 rounded transition-colors"
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
                        className="p-4 rounded-lg bg-white/10 border border-white/20"
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
                              <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                                {item.status}
                              </span>
                            </div>
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
                        className="p-4 rounded-lg bg-white/10 border border-white/20"
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Strategic Deck Tab */}
            {activeTab === "strategic-deck" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. HEALTH CONFIG */}
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-accent" />
                      Studio Health Strategy
                    </h3>
                    <p className="text-sm text-foreground/60 italic">
                      Define howMuhyo Tech's overall health score is determined.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                      <div>
                        <div className="font-bold">Health Mode</div>
                        <div className="text-xs text-foreground/40 uppercase font-black mt-0.5 tracking-widest">
                          Auto vs Manual Override
                        </div>
                      </div>
                      <div className="flex bg-background p-1 rounded-lg border border-white/10">
                        <button
                          onClick={() =>
                            handleUpdateConfig({
                              ...config,
                              healthMode: "auto",
                            })
                          }
                          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${config.healthMode === "auto" ? "bg-accent text-white" : "text-foreground/40 hover:text-foreground"}`}
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
                          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${config.healthMode === "manual" ? "bg-accent text-white" : "text-foreground/40 hover:text-foreground"}`}
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

                    <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10">
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
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 space-y-8">
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
                      className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white transition-all disabled:opacity-50 group"
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
                          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent/20 transition-all"
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

                  <div className="pt-4 border-t border-white/10 flex justify-center text-[10px] font-bold text-foreground/30 uppercase tracking-[0.3em]">
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background border border-white/20 rounded-lg p-6 max-w-lg w-full max-h-96 overflow-y-auto"
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
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground"
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
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground h-20"
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
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground"
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
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground"
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
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground"
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
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground"
                  />
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
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground font-semibold hover:bg-white/20"
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
