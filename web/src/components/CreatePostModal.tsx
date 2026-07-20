import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, ImageIcon, Users as UsersIcon, Smile, MapPin, X, Globe, Lock, ChevronDown, Check, Search } from "lucide-react";
import { api } from "../api";
import { Avatar } from "./Avatar";
import { Profile, Theme } from "../types";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (post: any) => void;
  profile: Profile;
  user: any;
  T: Theme;
}

export const CreatePostModal = ({ isOpen, onClose, onCreated, profile, user, T }: CreatePostModalProps) => {
  const [postText, setPostText] = useState("");
  const [bgTheme, setBgTheme] = useState("");
  const [privacy, setPrivacy] = useState<"Public" | "Friends" | "Private">("Public");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [feeling, setFeeling] = useState("");
  const [location, setLocation] = useState("");
  const [tagged, setTagged] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"feeling" | "location" | "tag" | "settings" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; fullName: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeMenu !== "tag" || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      api.get<{ users: { id: string; fullName: string }[] }>(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
        .then((d) => setSearchResults(d.users))
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeMenu]);

  if (!isOpen) return null;

  const privacyMap = { Public: "PUBLIC", Friends: "FRIENDS", Private: "PRIVATE" } as const;

  const handlePost = async () => {
    if (!postText.trim() && !attachment) return;
    setError("");
    setLoading(true);

    try {
      let attachmentUrl: string | undefined;

      if (attachmentFile) {
        const form = new FormData();
        form.append("file", attachmentFile);
        const { url } = await api.upload<{ url: string }>("/api/uploads", form);
        attachmentUrl = url;
      }

      const { post } = await api.post<{ post: any }>("/api/posts", {
        content: postText || (attachmentUrl ? "[Image]" : ""),
        attachment: attachmentUrl,
        bgTheme: bgTheme || undefined,
        feeling: feeling || undefined,
        location: location || undefined,
        taggedUserIds: tagged.map((t) => t.id),
        privacy: privacyMap[privacy],
      });
      onCreated(post);

      setPostText("");
      setAttachment(null);
      setAttachmentFile(null);
      setFeeling("");
      setLocation("");
      setTagged([]);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentFile(file);
      setAttachment(URL.createObjectURL(file));
      setBgTheme("");
    }
  };

  const feelingsList = ["happy 😊", "sad 😢", "good 👍", "bad 👎", "excited 🤩", "blessed 🙏", "loved ❤️"];
  const locationList = ["Berlin, Germany", "New York, USA", "London, UK", "Paris, France", "Tokyo, Japan"];

  if (activeMenu) {
    return (
      <div className={`fixed inset-0 z-[110] flex flex-col ${T.bg}`}>
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${T.line}`}>
          <button onClick={() => setActiveMenu(null)} className={`p-1 ${T.text}`}><ArrowLeft size={24} /></button>
          <h2 className={`text-lg font-bold ${T.text}`}>
            {activeMenu === "feeling" && "How are you feeling?"}
            {activeMenu === "location" && "Search Location"}
            {activeMenu === "tag" && "Tag people"}
            {activeMenu === "settings" && "Post Settings"}
          </h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {activeMenu === "feeling" && feelingsList.map(f => (
            <button key={f} onClick={() => { setFeeling(f); setActiveMenu(null); }} className={`w-full text-left px-4 py-3 hover:${T.card2} rounded-xl ${T.text} flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">{f.split(" ")[1]}</div>
              <span className="font-semibold">{f.split(" ")[0]}</span>
            </button>
          ))}
          {activeMenu === "location" && locationList.map(l => (
            <button key={l} onClick={() => { setLocation(l); setActiveMenu(null); }} className={`w-full text-left px-4 py-3 hover:${T.card2} rounded-xl ${T.text} flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-full ${T.card2} flex items-center justify-center`}><MapPin size={20} className="text-red-500" /></div>
              <span className="font-semibold">{l}</span>
            </button>
          ))}
          {activeMenu === "tag" && (
            <>
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-3 border ${T.line} ${T.input}`}>
                <Search size={16} className={T.sub} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search people by name..."
                  className="bg-transparent outline-none flex-1 text-sm"
                />
              </div>
              {searchQuery.trim().length < 2 ? (
                <p className={`text-center py-8 text-sm ${T.sub}`}>Type at least 2 characters to search</p>
              ) : searchResults.length === 0 ? (
                <p className={`text-center py-8 text-sm ${T.sub}`}>No people found matching "{searchQuery}"</p>
              ) : (
                searchResults.map((u) => {
                  const isTagged = tagged.some((t) => t.id === u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={() => setTagged((prev) => isTagged ? prev.filter((t) => t.id !== u.id) : [...prev, { id: u.id, name: u.fullName }])}
                      className={`w-full text-left px-4 py-3 hover:${T.card2} rounded-xl ${T.text} flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={u.fullName} />
                        <span className="font-semibold">{u.fullName}</span>
                      </div>
                      {isTagged && <Check size={18} className="text-orange-500" />}
                    </button>
                  );
                })
              )}
            </>
          )}
          {activeMenu === "settings" && (
            <div className="space-y-2">
              {(["Public", "Friends", "Private"] as const).map((p) => (
                <button key={p} onClick={() => { setPrivacy(p); setActiveMenu(null); }} className={`w-full text-left px-4 py-3 hover:${T.card2} rounded-xl ${T.text} flex items-center justify-between`}>
                  <span className="font-semibold">{p}</span>
                  {privacy === p && <Check size={18} className="text-orange-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
        {activeMenu === "tag" && (
           <div className="p-4 border-t border-gray-200">
             <button onClick={() => setActiveMenu(null)} className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl">Done</button>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col ${T.bg}`}>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
      <div className={`flex items-center justify-between px-4 py-3 border-b ${T.line}`}>
        <button onClick={onClose} className={`p-2 -ml-2 ${T.text}`}><ArrowLeft size={24} /></button>
        <div className="flex-1 text-center">
          <h2 className={`text-lg font-bold ${T.text}`}>Create post</h2>
          {error && <p className="text-[10px] text-red-500 font-bold uppercase">{error}</p>}
        </div>
        <button onClick={handlePost} disabled={loading || (!postText.trim() && !attachment)} className={`font-semibold ${(postText.trim() || attachment) ? "text-orange-500" : "opacity-50 " + T.sub}`}>
          {loading ? "..." : "POST"}
        </button>
      </div>
      <div className="flex px-4 py-3 gap-3 items-center">
        <Avatar name={profile?.name || "User"} size={10} />
        <div>
          <p className={`font-semibold text-sm ${T.text}`}>
            {profile?.name || "User"}
            {feeling && <span className="font-normal text-gray-500"> is feeling {feeling}</span>}
            {tagged.length > 0 && <span className="font-normal text-gray-500"> with {tagged.map((t) => t.name).join(", ")}</span>}
          </p>
          <button onClick={() => setActiveMenu("settings")} className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5 ${T.card2} ${T.sub}`}>
            {privacy === "Public" ? <Globe size={10} /> : <Lock size={10} />} {privacy} <ChevronDown size={10} />
          </button>
        </div>
      </div>
      <div className={`flex-1 p-4 ${bgTheme ? `${bgTheme} text-white flex items-center justify-center` : ""}`}>
        <textarea
          autoFocus
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="What's on your mind?"
          className={`w-full outline-none resize-none bg-transparent ${bgTheme ? "text-center text-2xl font-bold placeholder-white/70" : `text-lg ${T.text}`} h-full`}
        />
        {attachment && (
          <div className="relative mt-2">
            <img src={attachment} alt="Upload" className="w-full rounded-xl max-h-64 object-cover" />
            <button onClick={() => setAttachment(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={16} /></button>
          </div>
        )}
      </div>
      <div className={`mt-auto border-t ${T.line}`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className={`text-sm font-medium ${T.sub}`}>Add to your post</span>
          <div className="flex items-center gap-3">
            <button onClick={() => fileInputRef.current?.click()} className="text-green-500"><ImageIcon size={24} /></button>
            <button onClick={() => setActiveMenu("tag")} className="text-blue-500"><UsersIcon size={24} /></button>
            <button onClick={() => setActiveMenu("feeling")} className="text-yellow-500"><Smile size={24} /></button>
            <button onClick={() => setActiveMenu("location")} className="text-red-500"><MapPin size={24} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
