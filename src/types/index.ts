export interface ConnectionStatus {
  success: boolean;
  status: "open" | "connecting" | "waiting_qr" | "close" | "disconnected";
  isConnected: boolean;
  phoneNumber: string | null;
  hasQR: boolean;
  qrImage?: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface Metric {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}

export type TabId =
  | "control"
  | "logs"
  | "features"
  | "stats"
  | "profile"
  | "billing";

export interface ChatStats {
  jid: string;
  push_name: string;
  msg_count: number;
  last_active: string;
  last_latency?: number | null;
}

export interface PromptItem {
  id: string;
  name: string;
  content: string;
  is_active: boolean;
}

export interface ContactItem {
  jid: string;
  push_name: string;
  is_allowed: boolean;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key_value: string;
  model_name: string;
  api_version: string;
  is_active: boolean;
  created_at: string;
}

export interface BlockedAttempt {
  id: string;
  jid: string;
  push_name: string;
  attempted_at: string;
}
export interface ChatMessage {
  role: "user" | "model";
  content: string;
  media_url?: string;
  media_type?: "image" | "video" | "audio" | "document";
  timestamp: string;
  latency?: number;
  is_proactive?: boolean;
}

export interface AIControls {
  // Core
  is_ai_enabled: boolean;
  response_delay_mins: number;
  // Proactive
  is_proactive_enabled: boolean;
  proactive_idle_threshold_mins: number;
  proactive_max_per_cycle: number;
  // Media
  media_receive_enabled: boolean;
  media_save_to_cloud: boolean;
  media_send_enabled: boolean;
  media_confirm_before_save: boolean;
  // Group Chat
  group_chat_enabled: boolean;
  group_trigger_mention: boolean;
  group_trigger_reply: boolean;
  group_trigger_keyword: boolean;
  // History
  history_enabled: boolean;
  history_max_messages: number;
}

export const DEFAULT_AI_CONTROLS: AIControls = {
  is_ai_enabled: true,
  response_delay_mins: 0,
  is_proactive_enabled: false,
  proactive_idle_threshold_mins: 60,
  proactive_max_per_cycle: 3,
  media_receive_enabled: true,
  media_save_to_cloud: false,
  media_send_enabled: false,
  media_confirm_before_save: true,
  group_chat_enabled: false,
  group_trigger_mention: true,
  group_trigger_reply: true,
  group_trigger_keyword: false,
  history_enabled: true,
  history_max_messages: 10,
};
