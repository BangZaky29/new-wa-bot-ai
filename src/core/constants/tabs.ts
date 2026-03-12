import {
  BarChart3,
  Bot,
  Terminal,
  Sliders,
  User,
  CreditCard,
} from "lucide-react";

export const TABS = [
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "control", label: "Connect", icon: Bot },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "logs", label: "Monitor", icon: Terminal },
  { id: "features", label: "Features", icon: Sliders },
  { id: "profile", label: "Profile", icon: User },
] as const;

export type TabConfig = (typeof TABS)[number];
