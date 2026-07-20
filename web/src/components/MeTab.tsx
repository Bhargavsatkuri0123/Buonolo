import React, { useState, useEffect } from "react";
import { Newspaper, LayoutGrid, List, ChevronLeft, ChevronRight, Moon, Sun, Globe2, Shield, LogOut, Info, Bookmark, MapPin, Users, Settings, ChevronDown, ChevronUp, UserX } from "lucide-react";
import { Header, Logo, AppIcon } from "./Header";
import { Avatar } from "./Avatar";
import { Theme, Profile, Post } from "../types";
import { LOCATIONS, LANGS, SAF } from "../constants";
import { GroupView, EventView, UserView } from "./CommunityTab";
import { api } from "../api";

interface MeTabProps {
  meScreen: string;
  setMeScreen: (val: string) => void;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  feed: Post[];
  newsData: any[];
  newsIdx: number;
  setNewsIdx: React.Dispatch<React.SetStateAction<number>>;
  newsMode: string;
  setNewsMode: (val: string) => void;
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  lang: string;
  setLang: (val: string) => void;
  notif: any;
  setNotif: React.Dispatch<React.SetStateAction<any>>;
  settingsSubScreen: string;
  setSettingsSubScreen: (val: string) => void;
  handleLogout: () => void;
  fetchHostInfo: (origin: string, host: string, city: string) => Promise<{ success: boolean; error?: string }>;
  isUpdatingHost: boolean;
  setToastError: (val: string) => void;
  communitiesData: any[];
  T: Theme;
  toggleSave: (id: string) => void;
}

export const MeTab = ({
  meScreen, setMeScreen, profile, setProfile, feed, newsData, newsIdx, setNewsIdx, newsMode, setNewsMode,
  dark, setDark, lang, setLang, notif, setNotif, settingsSubScreen, setSettingsSubScreen,
  handleLogout, fetchHostInfo, isUpdatingHost, setToastError, communitiesData, T, toggleSave
}: MeTabProps) => {

  const NewsScreen = () => {
    const n = newsData[newsIdx];
    if (!n) return <div className="pb-24"><Header T={T} title="Local News" back={() => setMeScreen("root")} /><p className="text-center mt-10">No news available.</p></div>;
    return (
      <div className="pb-24">
        <Header T={T} title="Local News" back={() => setMeScreen("root")} right={
          <div className={`flex rounded-full p-1 ${T.card}`}>
            <button onClick={() => setNewsMode("cards")} className={`p-1.5 rounded-full ${newsMode === "cards" ? "bg-orange-500 text-white" : T.sub}`}><LayoutGrid size={15} /></button>
            <button onClick={() => setNewsMode("list")} className={`p-1.5 rounded-full ${newsMode === "list" ? "bg-orange-500 text-white" : T.sub}`}><List size={15} /></button>
          </div>} />
        {newsMode === "cards" ? (
          <div className="mx-4">
            <div className="rounded-3xl p-6 text-white min-h-[380px] flex flex-col cardin" key={n.id}
              style={{ background: "linear-gradient(150deg,#2b1a08 0%,#7c3a02 55%,#F26A00 130%)" }}>
              <span className="self-start text-[11px] font-bold uppercase tracking-wider bg-orange-500 px-2.5 py-1 rounded-full">{n.tag}</span>
              <h2 className="disp font-bold text-2xl leading-snug mt-4">{n.title}</h2>
              <p className="text-sm text-orange-100 leading-relaxed mt-3 flex-1">{n.body}</p>
              <p className="text-xs text-orange-200 mt-4">{n.time}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => setNewsIdx(i => Math.max(0, i - 1))} disabled={newsIdx === 0}
                className={`p-2.5 rounded-full ${T.card} disabled:opacity-40`}><ChevronLeft size={18} className={T.text} /></button>
              <div className="flex gap-1.5">
                {newsData.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === newsIdx ? "w-5 bg-orange-500" : `w-1.5 ${dark ? "bg-zinc-700" : "bg-orange-200"}`}`} />)}
              </div>
              <button onClick={() => setNewsIdx(i => Math.min(newsData.length - 1, i + 1))} disabled={newsIdx === newsData.length - 1}
                className={`p-2.5 rounded-full ${T.card} disabled:opacity-40`}><ChevronRight size={18} className={T.text} /></button>
            </div>
            <p className={`text-center text-xs mt-2 ${T.sub}`}>{newsIdx + 1} of {newsData.length} · swipe through today's local briefs</p>
          </div>
        ) : (
          <div className="mx-4 space-y-2">
            {newsData.map(x => (
              <div key={x.id} className={`${T.card} rounded-2xl p-4 cardin`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">{x.tag}</span>
                <p className={`font-semibold text-sm mt-1 ${T.text}`}>{x.title}</p>
                <p className={`text-xs mt-1 leading-relaxed ${T.sub}`}>{x.body}</p>
                <p className={`text-[11px] mt-2 ${T.sub}`}>{x.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SettingsScreen = () => {
    const initialHostSelect = LOCATIONS[profile.host] ? profile.host : "Other";
    const initialCitySelect = LOCATIONS[initialHostSelect]?.includes(profile.city) ? profile.city : "Other";

    const [hostData, setHostData] = useState({ 
      hostSelect: initialHostSelect, 
      citySelect: initialCitySelect, 
      customHost: initialHostSelect === "Other" ? profile.host : "",
      customCity: initialCitySelect === "Other" ? profile.city : ""
    });

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCountry = e.target.value;
      const firstCity = LOCATIONS[newCountry]?.[0] || "";
      setHostData({ ...hostData, hostSelect: newCountry, citySelect: firstCity, customHost: "", customCity: "" });
    };

    if (settingsSubScreen === "host") return (
      <div className="pb-24">
        <Header T={T} title="Host country & city" back={() => setSettingsSubScreen("root")} />
        <div className={`${T.card} mx-4 rounded-2xl p-4 space-y-4`}>
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Current Host Country</label>
            <select value={hostData.hostSelect} onChange={handleCountryChange} className={`w-full ${T.input} rounded-xl px-3 py-2 text-sm outline-none border ${T.line}`}>
              {Object.keys(LOCATIONS).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {hostData.hostSelect === "Other" && (
              <input placeholder="Enter Country..." value={hostData.customHost} onChange={(e) => setHostData({ ...hostData, customHost: e.target.value })} className={`w-full mt-2 ${T.input} rounded-xl px-3 py-2 text-sm outline-none border ${T.line}`} />
            )}
            <p className={`text-xs mt-1 ${T.sub}`}>Changing your host country will reset your goals and roadmap.</p>
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Current City</label>
            {hostData.hostSelect !== "Other" && (
              <select value={hostData.citySelect} onChange={(e) => setHostData({ ...hostData, citySelect: e.target.value })} className={`w-full ${T.input} rounded-xl px-3 py-2 text-sm outline-none border ${T.line}`}>
                {LOCATIONS[hostData.hostSelect]?.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            )}
            {(hostData.hostSelect === "Other" || hostData.citySelect === "Other") && (
              <input placeholder="Enter City..." value={hostData.customCity} onChange={(e) => setHostData({ ...hostData, customCity: e.target.value })} className={`w-full ${hostData.hostSelect !== "Other" ? "mt-2" : ""} ${T.input} rounded-xl px-3 py-2 text-sm outline-none border ${T.line}`} />
            )}
          </div>
          <button 
            onClick={async () => {
              const finalHost = hostData.hostSelect === "Other" ? hostData.customHost : hostData.hostSelect;
              const finalCity = hostData.citySelect === "Other" ? hostData.customCity : hostData.citySelect;
              if (!finalHost || !finalCity) return;
              const result = await fetchHostInfo(profile.origin, finalHost, finalCity);
              if (result.success) {
                setProfile({ ...profile, host: finalHost, city: finalCity });
              } else {
                setToastError(result.error || "Failed to update host.");
                setTimeout(() => setToastError(""), 5000);
              }
            }}
            disabled={isUpdatingHost || (hostData.hostSelect === "Other" && !hostData.customHost) || (hostData.citySelect === "Other" && !hostData.customCity) || (hostData.hostSelect === "Other" && !hostData.customCity)}
            className={`${isUpdatingHost ? 'opacity-50' : ''} bg-orange-500 text-white font-bold text-sm px-4 py-2 rounded-xl w-full`}>
              {isUpdatingHost ? 'Requesting...' : 'Request change'}
          </button>
        </div>
      </div>
    );

    if (settingsSubScreen === "privacy") {
      const [privacySettings, setPrivacySettings] = useState({
        visibility: "Public",
        showLocation: "City only",
        indexing: "Disabled"
      });
      const [isDeleting, setIsDeleting] = useState(false);
      const [isArchiving, setIsArchiving] = useState(false);

      return (
        <div className="pb-24">
          <Header T={T} title="Privacy & data" back={() => setSettingsSubScreen("root")} />
          <p className={`mx-4 mb-2 text-xs font-bold uppercase tracking-wider ${T.sub}`}>Profile Visibility</p>
          <div className={`${T.card} mx-4 rounded-2xl divide-y ${T.line} mb-6`}>
            {[
              ["Profile visibility", "visibility", ["Public", "Friends", "Private"]],
              ["Show my location", "showLocation", ["Exact", "City only", "None"]],
              ["Search engine indexing", "indexing", ["Enabled", "Disabled"]]
            ].map(([label, key, options]: any) => (
              <div key={label} className="p-4">
                <p className={`text-sm font-medium ${T.text} mb-3`}>{label}</p>
                <div className="flex flex-wrap gap-2">
                  {options.map((opt: string) => (
                    <button 
                      key={opt}
                      onClick={() => setPrivacySettings({...privacySettings, [key]: opt})}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${privacySettings[key as keyof typeof privacySettings] === opt ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : `${T.card2} ${T.sub}`}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className={`mx-4 mb-2 text-xs font-bold uppercase tracking-wider ${T.sub}`}>Data Management</p>
          <div className={`${T.card} mx-4 rounded-2xl p-4 space-y-4`}>
            <div>
              <p className={`text-sm font-semibold ${T.text}`}>Download my data</p>
              <p className={`text-xs ${T.sub} mt-1 leading-relaxed`}>Request a copy of your posts, messages, and profile data. We'll email you a link to your archive.</p>
              <button
                onClick={async () => {
                  setIsArchiving(true);
                  try {
                    const data = await api.get<any>("/api/users/me/export");
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "buonolo-data-export.json";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  } catch (e: any) {
                    alert(e.message || "Failed to export data.");
                  } finally {
                    setIsArchiving(false);
                  }
                }}
                disabled={isArchiving}
                className={`mt-3 w-full py-2.5 rounded-xl border ${T.line} text-sm font-bold ${T.text} hover:${T.card2} transition-colors flex items-center justify-center gap-2`}
              >
                {isArchiving ? "Preparing download..." : "Download my data"}
              </button>
            </div>
            
            <div className={`pt-4 border-t ${T.line}`}>
              <p className={`text-sm font-semibold text-red-500`}>Delete Account</p>
              <p className={`text-xs ${T.sub} mt-1 leading-relaxed`}>Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button
                onClick={async () => {
                  if (confirm("Are you absolutely sure you want to delete your account? This will remove all your posts, messages, and settings forever.")) {
                    setIsDeleting(true);
                    try {
                      await api.delete("/api/users/me");
                    } finally {
                      setIsDeleting(false);
                      handleLogout();
                    }
                  }
                }}
                disabled={isDeleting}
                className="mt-3 w-full py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-bold hover:bg-red-500/20 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete Account & Data"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (settingsSubScreen === "blocked") {
      const [blocked, setBlocked] = useState<{ id: string; fullName: string }[]>([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        api.get<{ users: { id: string; fullName: string }[] }>("/api/users/me/blocked")
          .then((d) => setBlocked(d.users))
          .finally(() => setLoading(false));
      }, []);

      const unblock = async (id: string) => {
        setBlocked((prev) => prev.filter((u) => u.id !== id));
        await api.delete(`/api/users/${id}/block`);
      };

      return (
        <div className="pb-24">
          <Header T={T} title="Blocked accounts" back={() => setSettingsSubScreen("root")} />
          {loading ? (
            <p className={`text-center mt-8 text-sm ${T.sub}`}>Loading...</p>
          ) : blocked.length === 0 ? (
            <div className={`${T.card} mx-4 rounded-2xl p-6 text-center`}>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                <Shield size={24} className="text-orange-500" />
              </div>
              <p className={`text-sm font-semibold ${T.text}`}>No blocked accounts</p>
              <p className={`text-xs mt-1 ${T.sub}`}>Accounts you block from their profile will appear here.</p>
            </div>
          ) : (
            <div className={`${T.card} mx-4 rounded-2xl divide-y ${T.line}`}>
              {blocked.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-4">
                  <Avatar name={u.fullName} size={9} />
                  <p className={`flex-1 text-sm font-semibold ${T.text}`}>{u.fullName}</p>
                  <button onClick={() => unblock(u.id)} className={`text-xs font-bold px-3 py-1.5 rounded-full ${T.card2} ${T.text} flex items-center gap-1`}>
                    <UserX size={12} /> Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="pb-24">
        <Header T={T} title="Settings" back={() => setMeScreen("root")} />
        <p className={`mx-4 mb-2 text-xs font-bold uppercase tracking-wider ${T.sub}`}>Appearance</p>
        <div className={`${T.card} mx-4 rounded-2xl divide-y ${T.line} mb-5`}>
          <button onClick={() => setDark(d => !d)} className="flex items-center justify-between w-full p-4">
            <div className="flex items-center gap-3">{dark ? <Moon size={18} className={T.text} /> : <Sun size={18} className={T.text} />}<p className={`text-sm font-medium ${T.text}`}>Theme</p></div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${T.card2} ${T.text}`}>{dark ? "Dark" : "Light"}</span>
          </button>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3"><Globe2 size={18} className={T.text} /><p className={`text-sm font-medium ${T.text}`}>App language</p></div>
            <div className="flex flex-wrap gap-2">
              {LANGS.map(l => (
                <button key={l} onClick={() => setLang(l)} className={`text-xs px-3 py-1.5 rounded-full font-medium ${lang === l ? "bg-orange-500 text-white" : `${T.card2} ${T.sub}`}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <p className={`mx-4 mb-2 text-xs font-bold uppercase tracking-wider ${T.sub}`}>Notifications</p>
        <div className={`${T.card} mx-4 rounded-2xl divide-y ${T.line} mb-5`}>
          {[["goals", "Goal reminders & deadlines"], ["community", "Community replies & messages"], ["news", "Daily local news brief"]].map(([k, label]) => (
            <button key={k} onClick={() => {
              const next = !notif[k as keyof typeof notif];
              setNotif((n: any) => ({ ...n, [k]: next }));
              if (k === "community") api.patch("/api/users/me", { notificationsEnabled: next }).catch(() => {});
            }} className="flex items-center justify-between w-full p-4">
              <p className={`text-sm font-medium ${T.text}`}>{label}</p>
              <span className={`w-11 h-6 rounded-full p-0.5 transition-colors ${notif[k as keyof typeof notif] ? "bg-orange-500" : dark ? "bg-zinc-700" : "bg-slate-300"}`}>
                <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${notif[k as keyof typeof notif] ? "translate-x-5" : ""}`} />
              </span>
            </button>
          ))}
        </div>
        <p className={`mx-4 mb-2 text-xs font-bold uppercase tracking-wider ${T.sub}`}>Account & privacy</p>
        <div className={`${T.card} mx-4 rounded-2xl divide-y ${T.line}`}>
          {[
            ["Host country & city", () => setSettingsSubScreen("host")], 
            ["Privacy & data", () => setSettingsSubScreen("privacy")], 
            ["Blocked accounts", () => setSettingsSubScreen("blocked")]
          ].map(([label, action]) => (
            <button key={label as string} onClick={action as () => void} className="flex items-center justify-between w-full p-4">
              <p className={`text-sm font-medium ${T.text}`}>{label as string}</p><ChevronRight size={16} className={T.sub} />
            </button>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-2 w-full p-4 text-red-500 text-sm font-medium"><LogOut size={16} /> Sign out</button>
        </div>
      </div>
    );
  };

  const PrivacyPolicyScreen = () => (
    <div className="pb-24">
      <Header T={T} title="Privacy Policy" back={() => setMeScreen("about")} />
      <div className={`${T.card} mx-4 rounded-2xl p-6 space-y-4 overflow-y-auto no-scrollbar max-h-[70vh]`}>
        <h3 className={`font-bold ${T.text}`}>1. Data We Collect</h3>
        <p className={`text-sm ${T.sub} leading-relaxed`}>We collect information you provide directly to us, such as your profile details (name, origin, host country), posts, and interactions within the community.</p>
        <h3 className={`font-bold ${T.text}`}>2. How We Use Data</h3>
        <p className={`text-sm ${T.sub} leading-relaxed`}>Your data is used to provide personalized migration guides, connect you with local communities, and improve the Buonolo experience.</p>
        <h3 className={`font-bold ${T.text}`}>3. Data Sharing</h3>
        <p className={`text-sm ${T.sub} leading-relaxed`}>We do not sell your personal data. Some information (like your public posts) is visible to other users of the platform based on your privacy settings.</p>
        <h3 className={`font-bold ${T.text}`}>4. Your Rights</h3>
        <p className={`text-sm ${T.sub} leading-relaxed`}>You have the right to access, update, or delete your data at any time through the "Privacy & data" settings.</p>
      </div>
    </div>
  );

  const TermsOfServiceScreen = () => (
    <div className="pb-24">
      <Header T={T} title="Terms of Service" back={() => setMeScreen("about")} />
      <div className={`${T.card} mx-4 rounded-2xl p-6 space-y-4 overflow-y-auto no-scrollbar max-h-[70vh]`}>
        <h3 className={`font-bold ${T.text}`}>1. Acceptance of Terms</h3>
        <p className={`text-sm ${T.sub} leading-relaxed`}>By using Buonolo, you agree to be bound by these terms. If you do not agree, please do not use the service.</p>
        <h3 className={`font-bold ${T.text}`}>2. User Conduct</h3>
        <p className={`text-sm ${T.sub} leading-relaxed`}>You agree to use Buonolo in a way that is respectful to others. Harassment, hate speech, and illegal activities are strictly prohibited.</p>
        <h3 className={`font-bold ${T.text}`}>3. Content Ownership</h3>
        <p className={`text-sm ${T.sub} leading-relaxed`}>You retain ownership of the content you post, but you grant us a license to display it on the platform.</p>
        <h3 className={`font-bold ${T.text}`}>4. Limitation of Liability</h3>
        <p className={`text-sm ${T.sub} leading-relaxed`}>Buonolo is provided "as is". We are not responsible for any losses or damages resulting from your use of the service.</p>
      </div>
    </div>
  );

  const AboutScreen = () => (
    <div className="pb-24">
      <Header T={T} title="About" back={() => setMeScreen("root")} />
      <div className={`${T.card} mx-4 rounded-2xl p-6 text-center`}>
        <div className="flex flex-col items-center gap-3 mb-3"><AppIcon size={72} /><Logo /></div>
        <p className={`text-sm ${T.sub} leading-relaxed`}>Buonolo helps people who've moved abroad settle in with confidence — guided goals, local tools, and a community that's been there.</p>
        <p className={`text-xs mt-4 ${T.sub}`}>Version 0.9.2 (build 148)</p>
        <p className={`text-xs mt-1 ${T.sub}`}>© 2026 Pearwave Technologies Ltd</p>
      </div>
      <div className={`${T.card} mx-4 mt-3 rounded-2xl divide-y ${T.line}`}>
        {[
          ["Terms of service", () => setMeScreen("termsOfService")], 
          ["Privacy policy", () => setMeScreen("privacyPolicy")], 
          ["Open-source licences", () => {}], 
          ["Rate Buonolo", () => {}], 
          ["Contact support", () => {}]
        ].map(([x, fn]: any) => (
          <button key={x} onClick={fn} className="flex items-center justify-between w-full p-4">
            <p className={`text-sm font-medium ${T.text}`}>{x}</p><ChevronRight size={16} className={T.sub} />
          </button>
        ))}
      </div>
    </div>
  );

  
  const CommunitiesScreen = () => {
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showSettings, setShowSettings] = useState(false);

    if (selectedUser) {
      return <UserView user={selectedUser} onClose={() => setSelectedUser(null)} T={T} onGroupClick={setSelectedGroup} />;
    }

    if (selectedEvent) {
      return <EventView event={selectedEvent} onClose={() => setSelectedEvent(null)} T={T} onUserClick={setSelectedUser} />;
    }

    if (selectedGroup) {
      return <GroupView group={selectedGroup} onClose={() => setSelectedGroup(null)} T={T} onUserClick={setSelectedUser} onEventClick={setSelectedEvent} />;
    }

    if (showSettings) {
      return (
        <div className="pb-24">
          <Header T={T} title="Community Settings" back={() => setShowSettings(false)} />
          <div className={`${T.card} mx-4 mt-4 rounded-2xl p-4 space-y-4`}>
            <div>
              <p className={`text-sm font-bold ${T.text}`}>Notifications</p>
              <div className="flex justify-between items-center mt-3">
                <p className={`text-sm ${T.sub}`}>New events in my groups</p>
                <div className="w-10 h-6 bg-orange-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <p className={`text-sm ${T.sub}`}>Group messages</p>
                <div className="w-10 h-6 bg-orange-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
              </div>
            </div>
            <div className={`border-t ${T.line} pt-4`}>
              <p className={`text-sm font-bold text-red-500`}>Leave all groups</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="pb-24">
        <Header T={T} title="Communities" back={() => setMeScreen("root")} right={<button onClick={() => setShowSettings(true)} className={`p-2 rounded-full ${T.card}`}><Settings size={18} className={T.text} /></button>} />
        {communitiesData.map(c => (
          <div key={c.name} onClick={() => setSelectedGroup(c)} className={`${T.card} mx-4 mb-2 rounded-2xl p-4 flex items-center gap-3 cursor-pointer`}>
            <span className="text-2xl">{c.emoji}</span>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${T.text}`}>{c.name}</p>
              <p className={`text-xs ${T.sub}`}>{c.members} members</p>
            </div>
            <ChevronRight size={16} className={T.sub} />
          </div>
        ))}
      </div>
    );
  };

const EditProfileScreen = () => {
    const initialHostSelect = LOCATIONS[profile.host] ? profile.host : "Other";
    const initialCitySelect = LOCATIONS[initialHostSelect]?.includes(profile.city) ? profile.city : "Other";

    const [formData, setFormData] = useState({
      ...profile,
      hostSelect: initialHostSelect,
      citySelect: initialCitySelect,
      customHost: initialHostSelect === "Other" ? profile.host : "",
      customCity: initialCitySelect === "Other" ? profile.city : ""
    });
    const [isUpdating, setIsUpdating] = useState(false);
    
    const saveProfile = async () => {
      const finalHost = formData.hostSelect === "Other" ? formData.customHost : formData.hostSelect;
      const finalCity = formData.citySelect === "Other" ? formData.customCity : formData.citySelect;

      if (!finalHost || !finalCity) return;

      if (finalHost !== profile.host || finalCity !== profile.city) {
        setIsUpdating(true);
        const result = await fetchHostInfo(profile.origin, finalHost, finalCity);
        setIsUpdating(false);
        if (result.success) {
          setProfile({ ...formData, host: finalHost, city: finalCity });
          setMeScreen("root");
        } else {
          setToastError(result.error || "Failed to update profile.");
          setTimeout(() => setToastError(""), 5000);
        }
      } else {
        setProfile({ ...formData, host: finalHost, city: finalCity });
        setMeScreen("root");
      }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCountry = e.target.value;
      const firstCity = LOCATIONS[newCountry]?.[0] || "";
      setFormData({ ...formData, hostSelect: newCountry, citySelect: firstCity, customHost: "", customCity: "" });
    };

    const isSaveDisabled = isUpdating || (formData.hostSelect === "Other" && !formData.customHost) || (formData.citySelect === "Other" && !formData.customCity) || (formData.hostSelect === "Other" && !formData.customCity);

    return (
      <div className="pb-24">
        <Header T={T} title="Edit Profile" back={() => setMeScreen("root")} right={<button disabled={isSaveDisabled} onClick={saveProfile} className={`font-bold text-sm px-2 ${isSaveDisabled ? 'text-orange-500/50' : 'text-orange-500'}`}>{isUpdating ? "Saving..." : "Save"}</button>} />
        <div className={`mx-4 space-y-4`}>
          <div className={`${T.card} p-4 rounded-2xl space-y-4`}>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full ${T.input} rounded-xl px-3 py-2 text-sm outline-none border ${T.line}`} />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Handle</label>
              <input value={formData.handle} onChange={e => setFormData({...formData, handle: e.target.value})} className={`w-full ${T.input} rounded-xl px-3 py-2 text-sm outline-none border ${T.line}`} />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Bio</label>
              <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className={`w-full ${T.input} rounded-xl px-3 py-2 text-sm outline-none border ${T.line} min-h-[80px] resize-none`} />
            </div>
          </div>
          <div className={`${T.card} p-4 rounded-2xl space-y-4`}>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Origin Country</label>
              <input value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className={`w-full ${T.input} rounded-xl px-3 py-2 text-sm outline-none border ${T.line}`} />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Host Country</label>
              <select value={formData.hostSelect} onChange={handleCountryChange} className={`w-full ${T.input} rounded-xl px-3 py-2 text-sm outline-none border ${T.line}`}>
                {Object.keys(LOCATIONS).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {formData.hostSelect === "Other" && (
                <input placeholder="Enter Country..." value={formData.customHost} onChange={e => setFormData({...formData, customHost: e.target.value})} className={`w-full mt-2 ${T.input} rounded-xl px-3 py-2 text-sm outline-none border ${T.line}`} />
              )}
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>City</label>
              {formData.hostSelect !== "Other" && (
                <select value={formData.citySelect} onChange={e => setFormData({...formData, citySelect: e.target.value})} className={`w-full ${T.input} rounded-xl px-3 py-2 text-sm outline-none border ${T.line}`}>
                  {LOCATIONS[formData.hostSelect]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              )}
              {(formData.hostSelect === "Other" || formData.citySelect === "Other") && (
                <input placeholder="Enter City..." value={formData.customCity} onChange={e => setFormData({...formData, customCity: e.target.value})} className={`w-full ${formData.hostSelect !== "Other" ? "mt-2" : ""} ${T.input} rounded-xl px-3 py-2 text-sm outline-none border ${T.line}`} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SavedPostsScreen = () => {
    const savedPosts = feed.filter(p => p.saved);
    return (
      <div className="pb-24">
        <Header T={T} title="Saved Posts" back={() => setMeScreen("root")} />
        <div className="mt-4">
          {savedPosts.length === 0 ? (
            <div className="text-center p-8">
              <Bookmark size={48} className={`mx-auto mb-4 opacity-20 ${T.text}`} />
              <p className={`font-semibold ${T.text}`}>No saved posts yet.</p>
              <p className={`text-sm mt-1 ${T.sub}`}>Posts you save will appear here.</p>
            </div>
          ) : (
            savedPosts.map(p => (
              <div key={p.id} className={`${T.card} mx-4 mb-3 rounded-2xl p-4 cardin`}>
                <div className="flex items-start gap-3">
                  <Avatar name={p.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold text-sm ${T.text}`}>{p.name}</p>
                      <button onClick={() => toggleSave(p.id)} className="text-orange-500">
                        <Bookmark size={15} fill="currentColor" />
                      </button>
                    </div>
                    <p className={`text-xs ${T.sub} mb-2`}>{p.time}</p>
                    <p className={`text-sm leading-relaxed ${T.text}`}>{p.text}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (meScreen === "news") return <NewsScreen />;
  if (meScreen === "settings") return <SettingsScreen />;
  if (meScreen === "about") return <AboutScreen />;
  if (meScreen === "privacyPolicy") return <PrivacyPolicyScreen />;
  if (meScreen === "termsOfService") return <TermsOfServiceScreen />;
  if (meScreen === "communities") return <CommunitiesScreen />;
  if (meScreen === "editProfile") return <EditProfileScreen />;
  if (meScreen === "saved") return <SavedPostsScreen />;
  
  return (
    <div className="pb-24">
      <Header T={T} title="Me" />
      <div className={`${T.card} mx-4 rounded-2xl p-5 cardin`}>
        <div className="flex items-center gap-4">
          <Avatar name={profile.name} size={14} ring />
          <div>
            <p className={`disp font-bold text-lg ${T.text}`}>{profile.name}</p>
            <p className={`text-xs ${T.sub}`}>{profile.handle}</p>
            <p className="text-xs mt-1">{profile.origin} → {profile.host} · <span className={T.sub}><MapPin size={10} className="inline" /> {profile.city}</span></p>
          </div>
        </div>
        <p className={`text-sm mt-3 leading-relaxed ${T.sub}`}>{profile.bio}</p>
        <div className="flex gap-6 mt-4">
          <p className={`text-sm ${T.text}`}><span className="disp font-bold">{profile.followers}</span> <span className={T.sub}>followers</span></p>
          <p className={`text-sm ${T.text}`}><span className="disp font-bold">{profile.following}</span> <span className={T.sub}>following</span></p>
          <button onClick={() => setMeScreen("editProfile")} className={`ml-auto text-xs font-semibold px-3 py-1.5 rounded-full ${T.card2} ${T.text}`}>Edit profile</button>
        </div>
      </div>
      <div className={`${T.card} mx-4 mt-4 rounded-2xl divide-y ${T.line}`}>
        {[
          [Newspaper, "Local news", `Daily flash cards for ${profile.city}`, () => setMeScreen("news")],
          [Users, "My communities", `${communitiesData.filter(c => c.joined).length} joined`, () => setMeScreen("communities")],
          [Bookmark, "Saved posts & guides", "", () => setMeScreen("saved")],
          [Settings, "Settings", "Language, theme, notifications", () => setMeScreen("settings")],
          [Info, "About Buonolo", "v0.9.2", () => setMeScreen("about")],
          [LogOut, "Log Out", "", handleLogout]
        ].map(([Icon, label, sub, fn]: any) => (
          <button key={label as string} onClick={fn} className="flex items-center gap-3 w-full p-4 text-left">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-700 flex items-center justify-center"><Icon size={17} /></div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${T.text}`}>{label}</p>
              {sub && <p className={`text-xs ${T.sub}`}>{sub}</p>}
            </div>
            <ChevronRight size={16} className={T.sub} />
          </button>
        ))}
      </div>
    </div>
  );
};
