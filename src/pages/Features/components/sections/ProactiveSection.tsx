import { Zap } from "lucide-react";
import { ToggleCard } from "../ToggleCard";
import type { SectionProps } from "../../types";
import { FeatureLockOverlay } from "../../../../ui/components/FeatureLockOverlay";

export function ProactiveSection({
  controls,
  updateControl,
  userFeatures,
  isFeatureLocked,
  lockedByPackage,
}: SectionProps) {
  return (
    <section className="glass-card rounded-[2rem] p-8 border border-slate-800/50 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {!userFeatures?.proactive_enabled && (
        <FeatureLockOverlay
          featureName="Proactive Nudge"
          requiredPackage="Premium"
          description="Bot dapat follow-up otomatis untuk meningkatkan engagement."
        />
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
          <Zap className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-black text-lg">Proactive Engine</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Auto follow-up & nudge
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">
        Proactive engine memungkinkan AI untuk berinisiatif menghubungi pelanggan jika ada percakapan yang menggantung. Bot akan otomatis melanjutkan obrolan atau me-nudge kontak berdasarkan batas waktu diam (idle threshold).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ToggleCard
          title="Proactive Nudge"
          description={
            controls.is_proactive_enabled
              ? "Follow-up otomatis aktif"
              : "Follow-up otomatis nonaktif"
          }
          enabled={controls.is_proactive_enabled}
          onToggle={() =>
            !isFeatureLocked("is_proactive_enabled") &&
            updateControl(
              "is_proactive_enabled",
              !controls.is_proactive_enabled,
            )
          }
          locked={isFeatureLocked("is_proactive_enabled")}
          requiredPackage="Premium"
        />

        <div className="p-6 rounded-3xl border bg-slate-800/30 border-slate-700/30 transition-all relative">
          {isFeatureLocked("proactive_config") &&
            lockedByPackage("Proactive Config", "Pro")}

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-black text-white uppercase">
              Idle Threshold
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-white">
                {controls.proactive_idle_threshold_mins}
              </span>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                Minutes
              </span>
            </div>
          </div>
          <input
            type="range"
            min={30}
            max={180}
            value={controls.proactive_idle_threshold_mins}
            onChange={(e) =>
              updateControl(
                "proactive_idle_threshold_mins",
                parseInt(e.target.value, 10),
              )
            }
            disabled={isFeatureLocked("proactive_config")}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />

          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm font-black text-white uppercase">
              Max per cycle
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateControl(
                    "proactive_max_per_cycle",
                    Math.max(1, controls.proactive_max_per_cycle - 1),
                  )
                }
                disabled={isFeatureLocked("proactive_config")}
                className="px-3 py-1 rounded-lg bg-slate-700 text-white text-xs font-black"
              >
                -
              </button>
              <span className="text-sm font-black text-white">
                {controls.proactive_max_per_cycle}
              </span>
              <button
                onClick={() =>
                  updateControl(
                    "proactive_max_per_cycle",
                    Math.min(10, controls.proactive_max_per_cycle + 1),
                  )
                }
                disabled={isFeatureLocked("proactive_config")}
                className="px-3 py-1 rounded-lg bg-slate-700 text-white text-xs font-black"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
