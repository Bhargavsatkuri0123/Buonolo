import React, { useState } from "react";
import { 
  Crown, ShieldCheck, Shield, User, Users, Check, X, Copy, 
  Share2, MessageCircle, Send, Search, ExternalLink, Link as LinkIcon, 
  Sparkles, Info, CheckCircle2
} from "lucide-react";
import { Avatar } from "./Avatar";
import { Theme, Profile } from "../types";
import { api } from "../api";

interface CommunityRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  T: Theme;
  group: any;
  currentUserRole?: "creator" | "admin" | "member";
}

export const CommunityRolesModal = ({
  isOpen,
  onClose,
  T,
  group,
  currentUserRole
}: CommunityRolesModalProps) => {
  const [activeSubTab, setActiveSubTab] = useState<"roles" | "comparison">("roles");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`w-full max-w-lg ${T.bg} rounded-3xl overflow-hidden shadow-2xl border ${T.line} max-h-[90vh] flex flex-col cardin`}>
        {/* Modal Header */}
        <div className={`p-5 border-b ${T.line} flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className={`text-base font-bold ${T.text}`}>Roles & Permissions</h2>
              <p className={`text-xs ${T.sub}`}>Governance structure for {group?.name || "communities"}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full ${T.card2} ${T.sub} hover:text-orange-500 transition-colors`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Sub-tabs */}
        <div className={`flex border-b ${T.line} px-5 pt-3 gap-6 shrink-0`}>
          <button
            onClick={() => setActiveSubTab("roles")}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeSubTab === "roles" ? "text-orange-500" : `${T.sub} hover:opacity-80`
            }`}
          >
            Role Breakdown
            {activeSubTab === "roles" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab("comparison")}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeSubTab === "comparison" ? "text-orange-500" : `${T.sub} hover:opacity-80`
            }`}
          >
            Permissions Matrix
            {activeSubTab === "comparison" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {activeSubTab === "roles" ? (
            <div className="space-y-3.5">
              {/* Creator Card */}
              <div className={`p-4 rounded-2xl border border-amber-300/70 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1.5 shadow-xs">
                      <Crown size={12} className="text-amber-600 dark:text-amber-400" />
                      Community Creator
                    </span>
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-200/50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">
                      Founder / Owner
                    </span>
                  </div>
                  {currentUserRole === "creator" && (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">Your Current Role</span>
                  )}
                </div>
                <p className={`text-xs ${T.text} leading-relaxed`}>
                  The founder who created this community. The Creator holds supreme governance authority and permanent ownership.
                </p>
                <div className="space-y-1.5 pt-1">
                  {[
                    "Exclusive authority to appoint and revoke multiple Admins",
                    "Full moderation rights: delete any post and pin announcements",
                    "Edit community name, description, privacy, and guidelines",
                    "Permanent immune status: Cannot be demoted or removed by other admins"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px]">
                      <Check size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span className={T.text}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Card */}
              <div className={`p-4 rounded-2xl border border-orange-300/70 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-950/20 space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-900 dark:bg-orange-900/60 dark:text-orange-300 border border-orange-300 dark:border-orange-700 flex items-center gap-1.5 shadow-xs">
                      <Shield size={12} className="text-orange-600 dark:text-orange-400" />
                      Community Admin
                    </span>
                    <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 bg-orange-200/50 dark:bg-orange-900/30 px-2 py-0.5 rounded-md">
                      Multi-Admins Supported
                    </span>
                  </div>
                  {currentUserRole === "admin" && (
                    <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300">Your Current Role</span>
                  )}
                </div>
                <p className={`text-xs ${T.text} leading-relaxed`}>
                  Trusted leaders appointed by the Creator to moderate discussions, maintain civil standards, and lead meetups. Communities can have multiple active admins.
                </p>
                <div className="space-y-1.5 pt-1">
                  {[
                    "Delete inappropriate, spam, or rule-violating discussion posts",
                    "Pin important community notices and announcements",
                    "Remove disruptive members who violate community guidelines",
                    "Organize, create, and manage community events and meetups",
                    "Cannot demote or remove the Community Creator"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px]">
                      <Check size={13} className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                      <span className={T.text}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Card */}
              <div className={`p-4 rounded-2xl border ${T.line} ${T.card} space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5">
                      <User size={12} className={T.sub} />
                      Community Member
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800/40 px-2 py-0.5 rounded-md">
                      Standard
                    </span>
                  </div>
                  {currentUserRole === "member" && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Your Current Role</span>
                  )}
                </div>
                <p className={`text-xs ${T.text} leading-relaxed`}>
                  Verified expat or local members who contribute to the group through questions, advice, events, and discussions.
                </p>
                <div className="space-y-1.5 pt-1">
                  {[
                    "Share updates, ask questions, and publish tips in discussion",
                    "Comment, like, and react to group conversations",
                    "RSVP and attend community events and meetups",
                    "Invite other expats and locals via Messenger or shareable link"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px]">
                      <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className={T.text}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Permissions Comparison Table */
            <div className={`rounded-2xl border ${T.line} overflow-hidden ${T.card}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`bg-orange-50/70 dark:bg-zinc-800/60 border-b ${T.line}`}>
                    <tr>
                      <th className={`p-3 font-bold ${T.text}`}>Privilege / Feature</th>
                      <th className="p-3 text-center font-bold text-amber-700 dark:text-amber-400">👑 Creator</th>
                      <th className="p-3 text-center font-bold text-orange-600 dark:text-orange-400">🛡️ Admin</th>
                      <th className={`p-3 text-center font-bold ${T.sub}`}>👤 Member</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${T.line}`}>
                    {[
                      { action: "Post updates & participate in discussions", creator: true, admin: true, member: true },
                      { action: "RSVP to community events", creator: true, admin: true, member: true },
                      { action: "Invite via Messenger or shareable link", creator: true, admin: true, member: true },
                      { action: "Delete any rule-violating post", creator: true, admin: true, member: false },
                      { action: "Pin community announcements", creator: true, admin: true, member: false },
                      { action: "Remove disruptive members", creator: true, admin: true, member: false },
                      { action: "Appoint & manage multiple Admins", creator: true, admin: false, member: false },
                      { action: "Edit community name & description", creator: true, admin: false, member: false },
                      { action: "Immune to demotion or removal", creator: true, admin: false, member: false },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-orange-50/30 dark:hover:bg-zinc-800/30">
                        <td className={`p-3 ${T.text} text-[11px] font-medium`}>{row.action}</td>
                        <td className="p-3 text-center">
                          {row.creator ? <Check size={14} className="mx-auto text-amber-600 dark:text-amber-400" /> : <X size={14} className="mx-auto text-gray-300" />}
                        </td>
                        <td className="p-3 text-center">
                          {row.admin ? <Check size={14} className="mx-auto text-orange-600 dark:text-orange-400" /> : <X size={14} className="mx-auto text-gray-300" />}
                        </td>
                        <td className="p-3 text-center">
                          {row.member ? <Check size={14} className="mx-auto text-emerald-500" /> : <X size={14} className="mx-auto text-gray-300" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${T.line} flex justify-end shrink-0`}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

interface CommunityInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
  T: Theme;
  onShareGroupToMessenger?: (group: any, targetThreadId?: string, targetThreadName?: string) => boolean | void;
  directMessages?: any[];
  onStartChat?: (id: string, name?: string) => void;
  user?: any;
  profile?: Profile;
  showToast: (msg: string) => void;
}

export const CommunityInviteModal = ({
  isOpen,
  onClose,
  group,
  T,
  onShareGroupToMessenger,
  directMessages = [],
  onStartChat,
  user,
  profile,
  showToast
}: CommunityInviteModalProps) => {
  const [activeTab, setActiveTab] = useState<"messenger" | "link" | "search">("messenger");
  const [copiedLink, setCopiedLink] = useState(false);
  const [sentMessengerIds, setSentMessengerIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [invitedUserIds, setInvitedUserIds] = useState<string[]>([]);

  if (!isOpen || !group) return null;

  // Generate robust invite link
  const inviteUrl = `${window.location.origin}${window.location.pathname}#community?group=${group.id}&invite=1`;

  // Get available messenger contacts
  const messengerContacts = (() => {
    const list: { id: string; name: string; subtitle?: string; avatar?: string }[] = [];
    
    // 1. Collect from active direct messages
    const threadIds = Array.from(new Set(directMessages.map((m: any) => m.threadId))).filter(Boolean);
    threadIds.forEach(tid => {
      const sample = directMessages.find((m: any) => m.threadId === tid);
      if (sample && sample.threadName) {
        list.push({
          id: tid,
          name: sample.threadName,
          subtitle: "Recent conversation",
          avatar: sample.threadName.substring(0, 2).toUpperCase()
        });
      }
    });

    return list;
  })();

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      showToast("Community invite link copied to clipboard! 📋");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast("Could not copy automatically. Link: " + inviteUrl);
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: `Join ${group.name} on Meet Peanut`,
      text: `Hey! Join the "${group.name}" community on Meet Peanut. Check it out:`,
      url: inviteUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("Invite link shared!");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSendViaMessenger = (contact: { id: string; name: string }) => {
    if (onShareGroupToMessenger) {
      onShareGroupToMessenger(group, contact.id, contact.name);
      setSentMessengerIds(prev => [...prev, contact.id]);
      showToast(`Invite sent to ${contact.name} in Messenger! 💬`);
    } else if (onStartChat) {
      onStartChat(contact.id, contact.name);
      onClose();
    } else {
      showToast(`Invite sent to ${contact.name}!`);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { users } = await api.users.search(query.trim());
      setSearchResults(users.map(u => ({ id: u.id, full_name: u.fullName, origin: u.origin })));
    } catch (e) {
      console.error("Failed to search users", e);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleSendAppInvite = async (targetUserId: string, targetUserName: string) => {
    setInvitedUserIds(prev => [...prev, targetUserId]);
    try {
      await api.groups.invite(group.id, targetUserId);
      showToast(`Invitation sent to ${targetUserName}!`);
    } catch (e: any) {
      showToast(e.message || `Could not invite ${targetUserName}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`w-full max-w-md ${T.bg} rounded-3xl overflow-hidden shadow-2xl border ${T.line} max-h-[90vh] flex flex-col cardin`}>
        {/* Modal Header */}
        <div className={`p-5 border-b ${T.line} flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0 shadow-xs">
              {group.emoji || "🏘️"}
            </div>
            <div className="min-w-0">
              <h2 className={`text-sm font-bold ${T.text} truncate`}>Invite to {group.name}</h2>
              <p className={`text-[11px] ${T.sub}`}>Choose how you'd like to share this community</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full ${T.card2} ${T.sub} hover:text-orange-500 transition-colors`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Option Tabs (Messenger vs. Link vs. Search) */}
        <div className={`flex border-b ${T.line} p-2 bg-orange-50/50 dark:bg-zinc-900/50 gap-1.5 shrink-0`}>
          <button
            onClick={() => setActiveTab("messenger")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "messenger"
                ? "bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm"
                : `${T.sub} hover:text-orange-500`
            }`}
          >
            <MessageCircle size={14} />
            <span>In Messenger</span>
          </button>

          <button
            onClick={() => setActiveTab("link")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "link"
                ? "bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm"
                : `${T.sub} hover:text-orange-500`
            }`}
          >
            <LinkIcon size={14} />
            <span>Share Link</span>
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "search"
                ? "bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm"
                : `${T.sub} hover:text-orange-500`
            }`}
          >
            <Search size={14} />
            <span>Find People</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* TAB 1: MESSENGER */}
          {activeTab === "messenger" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-bold ${T.text}`}>Send Direct in Messenger</p>
                  <p className={`text-[11px] ${T.sub}`}>Invited members receive an interactive community card</p>
                </div>
                {onShareGroupToMessenger && (
                  <button
                    onClick={() => {
                      onShareGroupToMessenger(group);
                      onClose();
                    }}
                    className="text-[11px] font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                  >
                    Open Chat <ExternalLink size={11} />
                  </button>
                )}
              </div>

              {/* Contacts List */}
              <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
                {messengerContacts.map(c => {
                  const isSent = sentMessengerIds.includes(c.id);
                  return (
                    <div 
                      key={c.id} 
                      className={`flex items-center gap-3 p-3 rounded-2xl ${T.card} border ${T.line} hover:border-orange-200 transition-all`}
                    >
                      <Avatar name={c.name} size={9} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${T.text} truncate`}>{c.name}</p>
                        <p className={`text-[10px] ${T.sub} truncate`}>{c.subtitle || "Meet Peanut Contact"}</p>
                      </div>
                      <button
                        onClick={() => handleSendViaMessenger(c)}
                        disabled={isSent}
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                          isSent 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
                            : "bg-orange-500 hover:bg-orange-600 text-white shadow-xs active:scale-95"
                        }`}
                      >
                        {isSent ? (
                          <>
                            <Check size={13} />
                            <span>Sent</span>
                          </>
                        ) : (
                          <>
                            <Send size={12} />
                            <span>Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Quick info footer */}
              <div className={`p-3 rounded-2xl bg-orange-50/70 dark:bg-zinc-800/40 border border-orange-100 dark:border-zinc-800 flex items-start gap-2.5`}>
                <Info size={15} className="text-orange-500 shrink-0 mt-0.5" />
                <p className={`text-[11px] ${T.sub} leading-relaxed`}>
                  Sending an invite embeds a live link in your conversation that lets the recipient join with a single click.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: LINK */}
          {activeTab === "link" && (
            <div className="space-y-4">
              <div>
                <p className={`text-xs font-bold ${T.text} mb-1`}>Community Shareable Link</p>
                <p className={`text-[11px] ${T.sub}`}>
                  Anyone with this link can view this community and join the discussion.
                </p>
              </div>

              {/* Link Input Box */}
              <div className={`p-2.5 rounded-2xl border ${T.line} ${T.card} flex items-center gap-2 shadow-xs`}>
                <LinkIcon size={16} className="text-orange-500 shrink-0 ml-1" />
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className={`bg-transparent outline-none flex-1 text-xs ${T.text} select-all truncate font-mono`}
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    copiedLink
                      ? "bg-emerald-500 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white shadow-xs active:scale-95"
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check size={13} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Social / Native Share Options */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleNativeShare}
                  className={`py-2.5 px-3 rounded-xl border ${T.line} ${T.card} hover:border-orange-300 text-xs font-bold ${T.text} flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs`}
                >
                  <Share2 size={15} className="text-orange-500" />
                  <span>Share via...</span>
                </button>

                <button
                  onClick={() => {
                    const waText = encodeURIComponent(`Hey! Join the "${group.name}" community on Meet Peanut: ${inviteUrl}`);
                    window.open(`https://wa.me/?text=${waText}`, "_blank");
                  }}
                  className={`py-2.5 px-3 rounded-xl border ${T.line} ${T.card} hover:border-emerald-300 text-xs font-bold ${T.text} flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs`}
                >
                  <span className="text-emerald-500 text-sm">💬</span>
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* Community Card Preview */}
              <div className={`p-4 rounded-2xl border border-orange-100 dark:border-zinc-800 ${T.card2} space-y-2`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${T.sub}`}>Link Preview</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-2xl shrink-0">
                    {group.emoji || "🏘️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${T.text} truncate`}>{group.name}</p>
                    <p className={`text-[11px] ${T.sub} line-clamp-1`}>{group.desc || "Expat community on Meet Peanut"}</p>
                    <p className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
                      {group.members || 1} members · {group.category || "General"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEARCH DIRECT */}
          {activeTab === "search" && (
            <div className="space-y-3">
              <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border ${T.line} ${T.input}`}>
                <Search size={15} className={T.sub} />
                <input 
                  autoFocus
                  placeholder="Search members by name or origin..." 
                  className="bg-transparent outline-none w-full text-xs"
                  value={searchQuery}
                  onChange={e => handleSearchUsers(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className={T.sub}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                {searchResults.length > 0 ? (
                  searchResults.map(u => {
                    const isInvited = invitedUserIds.includes(u.id);
                    return (
                      <div key={u.id} className={`flex items-center gap-3 p-2.5 rounded-2xl ${T.card} border ${T.line}`}>
                        <Avatar name={u.full_name || u.name} size={9} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${T.text} truncate`}>{u.full_name || u.name}</p>
                          <p className={`text-[10px] ${T.sub}`}>{u.origin || "Community Expat"}</p>
                        </div>
                        <button 
                          disabled={isInvited}
                          onClick={() => handleSendAppInvite(u.id, u.full_name || u.name)}
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all ${
                            isInvited 
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-orange-500 hover:bg-orange-600 text-white shadow-xs active:scale-95"
                          }`}
                        >
                          {isInvited ? "Invited ✓" : "Invite"}
                        </button>
                      </div>
                    );
                  })
                ) : searchQuery.length > 1 ? (
                  <p className={`text-center py-6 text-xs ${T.sub}`}>No members found matching "{searchQuery}"</p>
                ) : (
                  <p className={`text-center py-6 text-xs ${T.sub}`}>Type a name to search Meet Peanut members</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t ${T.line} flex justify-between items-center bg-orange-50/20 dark:bg-zinc-900/20 shrink-0`}>
          <p className={`text-[11px] ${T.sub}`}>
            {activeTab === "messenger" ? "Direct delivery via Messenger" : activeTab === "link" ? "Shareable URL" : "In-app Notification"}
          </p>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl ${T.card} border ${T.line} text-xs font-bold ${T.text} hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
