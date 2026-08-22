"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  UserCheck,
  UserX,
  AlertTriangle,
  Key,
  UserPlus,
  ShieldAlert,
  Inbox,
  Filter,
  Eye,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import AdminPageLoader from "@/components/admin/AdminPageLoader";

export default function MailDashboardClient({ userSession }) {
  const [activeTab, setActiveTab] = useState("emails"); // 'emails' | 'appeals'
  const [emails, setEmails] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Modals state
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyForm, setReplyForm] = useState({ to: "", subject: "", message: "" });
  const [sendingReply, setSendingReply] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // userId being processed
  const [toast, setToast] = useState(null);

  const fetchMailData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/mails");
      const data = await res.json();

      if (data.success) {
        setEmails(data.emails || []);
        setAppeals(data.appeals || []);
      } else {
        showToast(data.message || "Failed to load mail logs", "error");
      }
    } catch (err) {
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMailData();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenReply = (emailObj) => {
    setReplyForm({
      to: emailObj.to,
      subject: emailObj.subject.startsWith("Re:") ? emailObj.subject : `Re: ${emailObj.subject}`,
      message: "",
    });
    setReplyModalOpen(true);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyForm.to || !replyForm.subject || !replyForm.message) {
      showToast("Please fill all reply fields", "error");
      return;
    }

    setSendingReply(true);
    try {
      const res = await fetch("/api/admin/mails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_reply",
          ...replyForm,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast("Reply email sent successfully!");
        setReplyModalOpen(false);
        setReplyForm({ to: "", subject: "", message: "" });
        fetchMailData(true);
      } else {
        showToast(data.message || "Failed to send reply", "error");
      }
    } catch (err) {
      showToast("Error sending reply", "error");
    } finally {
      setSendingReply(false);
    }
  };

  const handleAppealAction = async (userId, appealAction) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/mails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "handle_appeal",
          userId,
          appealAction,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message);
        fetchMailData(true);
      } else {
        showToast(data.message || "Action failed", "error");
      }
    } catch (err) {
      showToast("Error executing action", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered emails
  const filteredEmails = emails.filter((mail) => {
    const matchesSearch =
      mail.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mail.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mail.text?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || mail.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case "password_reset":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Key className="w-3 h-3" /> Password Reset</span>;
      case "account_setup":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><UserPlus className="w-3 h-3" /> Account Setup</span>;
      case "account_restore":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><ShieldAlert className="w-3 h-3" /> Access Restore</span>;
      case "admin_reply":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20"><MessageSquare className="w-3 h-3" /> Admin Reply</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><Mail className="w-3 h-3" /> Notification</span>;
    }
  };

  if (loading && emails.length === 0 && appeals.length === 0) {
    return (
      <AdminPageLoader
        title="Loading System Communications"
        message="Hydrating encrypted audit logs, system emails, and access appeals..."
        badge="Super Admin Audit"
      />
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 flex items-center gap-3 ${
            toast.type === "error"
              ? "bg-red-950/80 border-red-500/30 text-red-200"
              : "bg-emerald-950/80 border-emerald-500/30 text-emerald-200"
          }`}
        >
          {toast.type === "error" ? <XCircle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              System Mail Audit & Communication
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Super Admin Only</span>
            </h1>
            <p className="text-sm text-slate-400">Track all outgoing system emails, credentials, password resets, and user access appeals.</p>
          </div>
        </div>

        <button
          onClick={() => fetchMailData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700/60 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Logs"}
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Total Mails Logged</span>
            <Inbox className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{emails.length}</p>
        </div>

        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Pending Appeals</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{appeals.length}</p>
        </div>

        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Successfully Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{emails.filter((m) => m.status === "sent").length}</p>
        </div>

        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Delivery Failures</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400 mt-2">{emails.filter((m) => m.status === "failed").length}</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("emails")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "emails"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            System Mail Logs ({emails.length})
          </button>
          <button
            onClick={() => setActiveTab("appeals")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === "appeals"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Account Appeals ({appeals.length})
            {appeals.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-500 text-slate-950 font-bold rounded-full">
                {appeals.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "emails" && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search recipient or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="all">All Mail Types</option>
              <option value="password_reset">Password Resets</option>
              <option value="account_setup">Account Setup</option>
              <option value="account_restore">Access Restore</option>
              <option value="admin_reply">Admin Replies</option>
              <option value="general_notification">General Notifications</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: System Emails */}
      {activeTab === "emails" && (
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-sm">Loading secure mail records...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-base font-medium text-slate-400">No system emails found</p>
              <p className="text-sm mt-1">Newly dispatched emails will automatically log here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Sent Time</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEmails.map((mail) => (
                    <tr key={mail._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        {mail.to}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-200">
                        {mail.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(mail.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {mail.status === "sent" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-medium" title={mail.error}>
                            <XCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {new Date(mail.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => setSelectedEmail(mail)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => handleOpenReply(mail)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-medium border border-indigo-500/30 transition-all inline-flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" /> Reply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Account Restore Appeals */}
      {activeTab === "appeals" && (
        <div className="space-y-4">
          {appeals.length === 0 ? (
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500/50" />
              <p className="text-base font-medium text-slate-300">No Pending Appeals</p>
              <p className="text-sm text-slate-500 mt-1">There are currently no restricted users awaiting access restoration.</p>
            </div>
          ) : (
            appeals.map((appeal) => (
              <div
                key={appeal._id}
                className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4 relative overflow-hidden backdrop-blur-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{appeal.name || "User"}</h3>
                      <p className="text-xs text-slate-400">{appeal.email} • Role: <span className="text-slate-300 capitalize">{appeal.role}</span></p>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400">
                    Submitted: {new Date(appeal.accessAppeal?.submittedAt || appeal.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Restriction Reason</span>
                    <p className="text-slate-300">{appeal.accessRestriction?.reason || "No specific reason logged"}</p>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-xs font-semibold text-amber-500/90 uppercase tracking-wider">User&apos;s Appeal Message</span>
                    <p className="text-slate-200 italic">&ldquo;{appeal.accessAppeal?.message || "No appeal message provided"}&rdquo;</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleAppealAction(appeal._id, "reject")}
                    disabled={actionLoading === appeal._id}
                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <UserX className="w-4 h-4" /> Reject Appeal
                  </button>
                  <button
                    onClick={() => handleAppealAction(appeal._id, "approve")}
                    disabled={actionLoading === appeal._id}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" /> Approve & Restore Access
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View Email Content Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Email Inspector</span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedEmail.subject}</h3>
                <p className="text-xs text-slate-400 mt-1">To: {selectedEmail.to} • {new Date(selectedEmail.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-sm text-slate-300 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-800">
                  <span>HTML Output Preview</span>
                  <span>Type: {selectedEmail.type}</span>
                </div>
                {selectedEmail.html ? (
                  <div
                    className="prose prose-invert max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-xs text-slate-400">{selectedEmail.text || "No content body"}</pre>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const mail = selectedEmail;
                  setSelectedEmail(null);
                  handleOpenReply(mail);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Reply Modal */}
      {replyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSendReply} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" /> Send Email Reply
              </h3>
              <button
                type="button"
                onClick={() => setReplyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">To Recipient</label>
                <input
                  type="email"
                  value={replyForm.to}
                  onChange={(e) => setReplyForm({ ...replyForm, to: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  value={replyForm.subject}
                  onChange={(e) => setReplyForm({ ...replyForm, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Message Content</label>
                <textarea
                  rows={5}
                  value={replyForm.message}
                  onChange={(e) => setReplyForm({ ...replyForm, message: e.target.value })}
                  placeholder="Type your official response here..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReplyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingReply}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sendingReply ? "Sending..." : "Dispatch Email"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
