import { History as HistoryIcon, Lock } from "lucide-react";
import { ToggleCard } from "../ToggleCard";
import type { SectionProps } from "../../types";

export function HistorySection({ controls, updateControl, userFeatures, isFeatureLocked }: SectionProps) {
  return (
    <section className="glass-card rounded-[2rem] p-8 border border-slate-800/50 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
          <HistoryIcon className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-white font-black text-lg">Memory & History</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Konteks percakapan
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">
        Bagian ini menentukan memori jangka pendek dari AI. Batas jumlah pesan (Max Messages) mengatur seberapa jauh AI dapat mengingat konteks obrolan sebelumnya dalam urutan pesan aktif. Matikan history jika ingin bot bekerja seperti bot faq statis.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ToggleCard
          title="Enable History"
          description="Simpan riwayat chat"
          enabled={controls.history_enabled}
          locked={isFeatureLocked("history_enabled")}
          requiredPackage="Basic"
          onToggle={() =>
            !isFeatureLocked("history_enabled") &&
            updateControl("history_enabled", !controls.history_enabled)
          }
        />

        <div className="p-6 rounded-3xl border bg-slate-800/30 border-slate-700/30 transition-all relative">
          {userFeatures?.max_history_messages &&
            controls.history_max_messages >
              userFeatures.max_history_messages && (
              <div className="absolute top-4 right-4 z-20">
                <Lock className="w-4 h-4 text-yellow-500" />
              </div>
            )}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-black text-white uppercase">
              Max Messages
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-white">
                {controls.history_max_messages}
              </span>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                Messages
              </span>
            </div>
          </div>
          <input
            type="range"
            min={5}
            max={userFeatures?.max_history_messages ?? 10}
            value={controls.history_max_messages}
            disabled={isFeatureLocked("history_enabled")}
            onChange={(e) =>
              updateControl(
                "history_max_messages",
                parseInt(e.target.value, 10),
              )
            }
            className={`w-full h-1.5 bg-slate-700 rounded-lg appearance-none accent-amber-500 ${isFeatureLocked("history_enabled") ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          />
          <div className="flex justify-between mt-2 text-[8px] font-black text-slate-600 uppercase">
            <span>5</span>
            <span>{userFeatures?.max_history_messages ?? 10}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
