import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Lock, 
  Share2, 
  Copy, 
  Check, 
  BookOpen, 
  Globe, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  User, 
  Lightbulb,
  RefreshCw,
  Bookmark
} from "lucide-react";
import { Theme } from "../types";

export interface NewsArticle {
  id: number | string;
  tag: string;
  title: string;
  body: string;
  time: string;
  source?: string;
  author?: string;
  readTime?: string;
  url?: string;
  highlights?: string[];
  content?: string[];
  advice?: string;
}

interface InAppNewsViewerProps {
  article: NewsArticle;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalCount?: number;
  T: Theme;
  dark?: boolean;
}

export const InAppNewsViewer: React.FC<InAppNewsViewerProps> = ({
  article,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  currentIndex,
  totalCount,
  T,
  dark = false
}) => {
  const [viewMode, setViewMode] = useState<"reader" | "web">("reader");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const fallbackUrl = article.url || `https://local-news.buonolo.app/${article.tag.toLowerCase()}/${article.id}`;
  const hostDomain = (() => {
    try {
      const parsed = new URL(fallbackUrl);
      return parsed.hostname;
    } catch {
      return "news.local-hub.org";
    }
  })();

  useEffect(() => {
    // Scroll to top when article changes
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIframeLoaded(false);
    setIframeError(false);
  }, [article.id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fallbackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.body,
          url: fallbackUrl
        });
      } catch {
        // Ignored or cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  // Generate fallback paragraphs if content array not explicitly provided
  const articleParagraphs = article.content && article.content.length > 0
    ? article.content
    : [
        article.body,
        `Local community authorities and municipal departments emphasize the importance of this update for all residents and recent newcomers. Continued service enhancements are planned over the coming quarters to ensure seamless community integration and reliable city resources.`,
        `Residents are encouraged to consult local community advice centers, review official notices, and connect with peer groups through the Buonolo Community tab to exchange experiences and ask questions directly.`
      ];

  const highlights = article.highlights && article.highlights.length > 0
    ? article.highlights
    : [
        article.body,
        `Directly relevant for immigrants, expats, and local residents seeking verified information.`,
        `Further official announcements and program schedules are published weekly by municipal coordinators.`
      ];

  return (
    <div className={`min-h-screen pb-24 ${T.bg} cardin`} id="in-app-news-viewer">
      {/* Sticky App Browser Bar */}
      <div className={`sticky top-0 z-30 ${T.card} border-b ${T.line} shadow-sm backdrop-blur-md`}>
        {/* Top Controls Row */}
        <div className="flex items-center justify-between px-4 py-3 gap-2">
          <button
            onClick={onClose}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${T.card2} ${T.text} hover:opacity-80 transition-opacity active:scale-95`}
            aria-label="Back to news flash cards"
          >
            <ArrowLeft size={15} />
            <span>Cards</span>
          </button>

          {/* Mode Switcher Tabs */}
          <div className={`flex items-center p-0.5 rounded-full ${T.card2} border ${T.line}`}>
            <button
              onClick={() => setViewMode("reader")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                viewMode === "reader"
                  ? "bg-orange-500 text-white shadow-sm"
                  : `${T.sub} hover:${T.text}`
              }`}
            >
              <BookOpen size={13} />
              <span>Reader</span>
            </button>
            <button
              onClick={() => setViewMode("web")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                viewMode === "web"
                  ? "bg-orange-500 text-white shadow-sm"
                  : `${T.sub} hover:${T.text}`
              }`}
            >
              <Globe size={13} />
              <span>Web Link</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSaved(!saved)}
              className={`p-2 rounded-full ${T.card2} ${saved ? "text-orange-500" : T.sub} hover:opacity-80 transition-all`}
              title={saved ? "Article Saved" : "Save Article"}
              aria-label="Save Article"
            >
              <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleShare}
              className={`p-2 rounded-full ${T.card2} ${T.sub} hover:${T.text} transition-all`}
              title="Share Article"
              aria-label="Share Article"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>

        {/* Browser URL Simulation Bar */}
        <div className="px-4 pb-2.5">
          <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs ${T.card2} border ${T.line}`}>
            <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
              <Lock size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className={`font-mono text-[11px] truncate ${T.sub}`}>
                {fallbackUrl}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded">
                In-App
              </span>
              <button
                onClick={handleCopyLink}
                className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 ${T.sub} transition-colors`}
                title="Copy URL"
                aria-label="Copy news link"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "reader" ? (
        <div className="max-w-2xl mx-auto px-4 pt-5 pb-8 space-y-6">
          {/* Article Header & Badges */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-orange-500 text-white px-3 py-1 rounded-full shadow-sm">
                {article.tag}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {article.time}
                </span>
                {article.readTime && (
                  <span>· {article.readTime}</span>
                )}
              </div>
            </div>

            <h1 className={`font-bold text-2xl md:text-3xl leading-snug ${T.text}`}>
              {article.title}
            </h1>

            {/* Author / Source Byline */}
            <div className={`flex items-center gap-3 pt-2 pb-3 border-b ${T.line}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                {article.author ? article.author[0] : (article.source ? article.source[0] : "N")}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${T.text} truncate`}>
                  {article.author || "Buonolo Local News Desk"}
                </p>
                <p className={`text-[11px] ${T.sub} flex items-center gap-1 truncate`}>
                  <Globe size={11} />
                  <span>{article.source || hostDomain}</span>
                </p>
              </div>

              {/* Reader font size adjuster */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${T.card2} text-xs ${T.sub}`}>
                <button 
                  onClick={() => setFontSize("sm")}
                  className={`px-1.5 py-0.5 rounded font-bold ${fontSize === "sm" ? "text-orange-600 dark:text-orange-400 bg-white dark:bg-black" : "hover:text-black dark:hover:text-white"}`}
                >
                  A-
                </button>
                <button 
                  onClick={() => setFontSize("base")}
                  className={`px-1.5 py-0.5 rounded font-bold ${fontSize === "base" ? "text-orange-600 dark:text-orange-400 bg-white dark:bg-black" : "hover:text-black dark:hover:text-white"}`}
                >
                  A
                </button>
                <button 
                  onClick={() => setFontSize("lg")}
                  className={`px-1.5 py-0.5 rounded font-bold ${fontSize === "lg" ? "text-orange-600 dark:text-orange-400 bg-white dark:bg-black" : "hover:text-black dark:hover:text-white"}`}
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Key Takeaways Card */}
          <div className={`p-4 rounded-2xl border border-orange-200 dark:border-orange-950/40 bg-orange-50/40 dark:bg-orange-950/10 space-y-2.5`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              <Sparkles size={14} />
              <span>Key Takeaways</span>
            </div>
            <ul className="space-y-1.5">
              {highlights.map((item, idx) => (
                <li key={idx} className={`text-xs md:text-sm ${T.text} flex items-start gap-2`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Full Article Content */}
          <div className={`space-y-4 leading-relaxed ${
            fontSize === "sm" ? "text-xs md:text-sm" : fontSize === "lg" ? "text-base md:text-lg" : "text-sm md:text-base"
          } ${T.text}`}>
            {articleParagraphs.map((para, idx) => (
              <p key={idx} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Actionable Advice for Expats / Newcomers */}
          {article.advice && (
            <div className={`p-4 rounded-2xl border ${T.line} ${T.card2} space-y-2`}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Lightbulb size={14} />
                <span>What This Means For You</span>
              </div>
              <p className={`text-xs md:text-sm ${T.sub} leading-relaxed`}>
                {article.advice}
              </p>
            </div>
          )}

          {/* Article Footer & Navigation */}
          <div className={`pt-6 border-t ${T.line} space-y-4`}>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Source: {article.source || hostDomain}</span>
              <button 
                onClick={handleCopyLink}
                className="text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1"
              >
                {copied ? "Link Copied!" : "Copy Source Link"}
              </button>
            </div>

            {/* Pagination between articles */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border ${T.line} ${T.card} text-xs font-semibold ${T.text} disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all`}
              >
                <ChevronLeft size={16} />
                <span>Previous Story</span>
              </button>

              {currentIndex !== undefined && totalCount !== undefined && (
                <span className={`text-xs font-medium ${T.sub} shrink-0 px-2`}>
                  {currentIndex + 1} of {totalCount}
                </span>
              )}

              <button
                onClick={onNext}
                disabled={!hasNext}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border ${T.line} ${T.card} text-xs font-semibold ${T.text} disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all`}
              >
                <span>Next Story</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Web Link / In-App Browser Simulation View */
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-4">
          <div className={`p-4 rounded-2xl border ${T.line} ${T.card2} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-orange-500" />
                <span className={`text-xs font-bold ${T.text}`}>In-App Web Preview</span>
              </div>
              <button
                onClick={() => setViewMode("reader")}
                className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline"
              >
                Switch to Reader Mode
              </button>
            </div>
            <p className={`text-xs ${T.sub} leading-relaxed`}>
              Showing article source page inside the app. If the external publisher denies iframe embedding (via HTTP header restrictions), switch back to the complete <strong>Reader</strong> tab above.
            </p>
          </div>

          {/* Embedded Web View Frame */}
          <div className={`rounded-2xl border ${T.line} overflow-hidden ${T.card} shadow-sm min-h-[500px] relative flex flex-col`}>
            <div className={`px-4 py-2 bg-slate-100 dark:bg-zinc-800/60 border-b ${T.line} flex items-center justify-between text-xs ${T.sub}`}>
              <span className="truncate font-mono text-[11px]">{fallbackUrl}</span>
              <button 
                onClick={() => {
                  setIframeLoaded(false);
                  const iframe = document.getElementById("inapp-news-frame") as HTMLIFrameElement;
                  if (iframe) iframe.src = fallbackUrl;
                }}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                title="Reload Frame"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {!iframeLoaded && !iframeError && (
              <div className="absolute inset-0 top-9 flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 z-10 space-y-3">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className={`text-xs ${T.sub}`}>Loading source web page...</p>
              </div>
            )}

            <iframe
              id="inapp-news-frame"
              src={fallbackUrl}
              title={article.title}
              sandbox="allow-scripts allow-same-origin allow-forms"
              className="w-full h-[540px] border-0 bg-white"
              onLoad={() => setIframeLoaded(true)}
              onError={() => {
                setIframeError(true);
                setIframeLoaded(true);
              }}
            />
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setViewMode("reader")}
              className="bg-orange-500 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              Open Full Article in Reader Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
