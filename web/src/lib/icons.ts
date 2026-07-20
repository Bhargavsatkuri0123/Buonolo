import {
  FileText, KeyRound, CreditCard, Languages, Car, Briefcase, Stethoscope, Users, Building,
  Scale, BookOpen, GraduationCap, Store, Heart, Church, Dumbbell, AlertTriangle, MessageCircle,
  Gavel, Handshake, Globe, Target, Smartphone, LucideIcon,
} from "lucide-react";

// Icon fields travel from the backend as plain strings (Goal.iconName, GoalTemplate.iconName,
// HostInfo tool item `icon`) since a React component can't be stored in JSON/Postgres.
export const ICONS: Record<string, LucideIcon> = {
  FileText, KeyRound, CreditCard, Languages, Car, Briefcase, Stethoscope, Users, Building,
  Scale, BookOpen, GraduationCap, Store, Heart, Church, Dumbbell, AlertTriangle, MessageCircle,
  Gavel, Handshake, Globe, Target, Smartphone,
};

export function resolveIcon(name: string | undefined | null): LucideIcon {
  return (name && ICONS[name]) || Target;
}
