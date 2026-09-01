const fs = require('fs');

// 1. Update types.ts
let typesCode = fs.readFileSync('src/types.ts', 'utf8');
if (!typesCode.includes('myReaction?: string')) {
  typesCode = typesCode.replace('reactions?: { emoji: string; count: number }[];', 'reactions?: { emoji: string; count: number }[];\n  myReaction?: string;');
  fs.writeFileSync('src/types.ts', typesCode);
}

// 2. Update LikeButton.tsx
let likeBtnCode = fs.readFileSync('src/components/LikeButton.tsx', 'utf8');
likeBtnCode = `import React, { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { Post } from "../types";

function useLongPress(callback: () => void, ms: number = 500) {
  const timerRef = useRef<any>();
  const start = () => {
    timerRef.current = setTimeout(callback, ms);
  };
  const stop = () => {
    clearTimeout(timerRef.current);
  };
  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
}

interface LikeButtonProps {
  p: Post | any;
  user?: any;
  toggleLike: (p: any) => void;
  activeReactions: string | null;
  setActiveReactions: (val: string | null) => void;
  addReaction: (id: string, emoji: string) => void;
}

export const LikeButton = ({ p, user, toggleLike, activeReactions, setActiveReactions, addReaction }: LikeButtonProps) => {
  const longPressProps = useLongPress(() => {
    setActiveReactions(activeReactions === p.id ? null : p.id);
  }, 400);

  return (
    <div className="relative">
      <button 
        onClick={() => toggleLike(p)} 
        onContextMenu={(e) => { e.preventDefault(); setActiveReactions(activeReactions === p.id ? null : p.id); }}
        className={\`flex items-center gap-1 \${p.liked || p.myReaction ? "text-orange-500" : ""}\`}
        {...longPressProps}
      >
        {p.myReaction ? (
          <span className="text-base leading-none mr-1">{p.myReaction}</span>
        ) : (
          <Heart size={15} fill={p.liked ? "currentColor" : "none"} />
        )} 
        {p.likes}
      </button>
      
      {activeReactions === p.id && (
        <div className={\`absolute bottom-full left-0 mb-2 p-2 rounded-full shadow-lg flex gap-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 z-10\`}>
          {["👍", "❤️", "😂", "😮", "😢", "😡"].map(emoji => (
            <button key={emoji} onClick={() => addReaction(p.id, emoji)} className="text-xl hover:scale-125 transition-transform">{emoji}</button>
          ))}
        </div>
      )}
    </div>
  );
};
`;
fs.writeFileSync('src/components/LikeButton.tsx', likeBtnCode);
