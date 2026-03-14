import { useMemo, useState } from "react";
import {
  Sliders,
  Bot,
  Zap,
  Image as ImageIcon,
  Users,
  History as HistoryIcon,
  Save,
  X,
  RefreshCcw,
  CheckCircle,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFeatureControls } from "../../core/hooks/useFeatureControls";
import { SubscribeBadge } from "../../ui/components/SubscribeBadge";
import { ScrollContainer } from "../../ui/components/ScrollContainer";

// Sections Components
import { CoreSection } from "./components/sections/CoreSection";
import { ProactiveSection } from "./components/sections/ProactiveSection";
import { MediaSection } from "./components/sections/MediaSection";
import { GroupChatSection } from "./components/sections/GroupChatSection";
import { HistorySection } from "./components/sections/HistorySection";
import { AdvancedSection } from "./components/sections/AdvancedSection";

interface FeaturesProps {
  userId?: string;
}

export function Features({ userId }: FeaturesProps) {
  const effectiveUserId = useMemo(
    () => userId || localStorage.getItem("wa_session_id") || undefined,
    [userId],
  );

  const [activeTab, setActiveTab] = useState<
    "core" | "proactive" | "media" | "group" | "history" | "system"
  >("core");

  const tabs = [
    { id: "core", label: "Core AI", icon: Bot },
    { id: "proactive", label: "Proactive", icon: Zap },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "group", label: "Group Chat", icon: Users },
    { id: "history", label: "Summary", icon: HistoryIcon },
    { id: "system", label: "Advanced", icon: Sliders },
  ] as const;

  const {
    controls,
    updateControl,
    loading,
    saving,
    isDirty,
    saveSuccess,
    saveError,
    saveControls,
    discardChanges,
    isFeatureLocked,
    userFeatures,
  } = useFeatureControls(effectiveUserId);

  const lockedByPackage = (key: string, required: string) => (
    <div className="absolute top-4 right-4 z-20">
      <SubscribeBadge featureName={key} requiredPackage={required} />
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RefreshCcw className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-slate-400 font-medium">Loading feature controls...</p>
      </div>
    );
  }

  const sectionProps = {
    controls,
    updateControl,
    isFeatureLocked,
    userFeatures,
    lockedByPackage,
  };

  return (
    <div className="space-y-8">
      {/* Header Shell */}
      <div className="glass-card rounded-[2rem] p-8 border border-slate-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 blur-[60px] rounded-full -mr-16 -mt-16" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/30">
              <Sliders className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Feature Control Center
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Semua fitur bot dalam satu tempat
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveControls}
              disabled={!isDirty || saving}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                !isDirty || saving
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
              }`}
            >
              {saving ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <button
              onClick={discardChanges}
              disabled={!isDirty}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                !isDirty
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700"
                  : "bg-slate-700 hover:bg-slate-600 text-white"
              }`}
            >
              <X className="w-4 h-4" />
              Discard
            </button>
          </div>
        </div>

        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold"
            >
              {saveError}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Settings saved successfully
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs Filter */}
      <ScrollContainer className="bg-slate-800/50 rounded-2xl border border-slate-700/50">
        <div className="flex gap-2 p-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            // Dynamic Lock Logic
            let isTabLocked = false;
            if (userFeatures && !userFeatures.is_admin) {
              if (tab.id === "proactive" && !userFeatures.proactive_enabled)
                isTabLocked = true;
              if (tab.id === "media" && !userFeatures.media_save_enabled)
                isTabLocked = true;
              if (tab.id === "group" && !userFeatures.group_chat_enabled)
                isTabLocked = true;
              if (tab.id === "history" && userFeatures.history_retention_days === 0)
                isTabLocked = true;
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap relative ${
                  isActive
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isTabLocked && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-lg">
                    <Lock className="w-2 h-2 text-slate-950 font-black" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </ScrollContainer>

      {/* Conditional Rendering using Components */}
      {activeTab === "core" && <CoreSection {...sectionProps} />}
      {activeTab === "proactive" && <ProactiveSection {...sectionProps} />}
      {activeTab === "media" && <MediaSection {...sectionProps} />}
      {activeTab === "group" && <GroupChatSection {...sectionProps} />}
      {activeTab === "history" && <HistorySection {...sectionProps} />}
      {activeTab === "system" && <AdvancedSection />}
    </div>
  );
}
