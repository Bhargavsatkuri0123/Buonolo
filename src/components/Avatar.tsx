import React from "react";
import { SAF } from "../constants";

interface AvatarProps {
  name: string;
  size?: number;
  ring?: boolean;
  url?: string;
}

export const Avatar = ({ name, size = 10, ring, url }: AvatarProps) => (
  <div 
    className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold shrink-0 overflow-hidden ${ring ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-black" : ""}`}
    style={{ background: SAF }}
  >
    {url ? (
      <img src={url} alt={name} className="w-full h-full object-cover" />
    ) : (
      (name || "U").split(" ").map(w => w[0]).slice(0, 2).join("")
    )}
  </div>
);
