import React from "react";
import { SAF } from "../constants";

interface AvatarProps {
  name: string;
  size?: number;
  ring?: boolean;
}

export const Avatar = ({ name, size = 10, ring }: AvatarProps) => (
  <div 
    className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold shrink-0 ${ring ? "ring-2 ring-orange-500 ring-offset-2" : ""}`}
    style={{ background: SAF }}
  >
    { (name || "U").split(" ").map(w => w[0]).slice(0, 2).join("")}
  </div>
);
