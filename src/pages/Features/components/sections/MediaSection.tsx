import { Image as ImageIcon } from "lucide-react";
import { ToggleCard } from "../ToggleCard";
import type { SectionProps } from "../../types";

export function MediaSection({
  controls,
  updateControl,
  isFeatureLocked,
}: SectionProps) {
  return (
    <section className="glass-card rounded-[2rem] p-8 border border-slate-800/50 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
          <ImageIcon className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-white font-black text-lg">Media Features</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Gambar, video, audio
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">
        Fitur ini mengatur bagaimana AI berinteraksi dengan media. Anda dapat memberikan kemampuan kepada AI untuk melihat dan menganalisis gambar/video yang masuk, menyimpannya ke penyimpanan Cloud untuk dokumentasi, hingga mengizinkan AI mencari dan mengirim ulang media tersebut ke user jika diminta.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ToggleCard
          title="Receive & Analyze Media"
          description="AI bisa membaca dan menganalisis media masuk"
          enabled={controls.media_receive_enabled}
          locked={isFeatureLocked("media_receive_enabled")}
          requiredPackage="Premium"
          onToggle={() =>
            !isFeatureLocked("media_receive_enabled") &&
            updateControl(
              "media_receive_enabled",
              !controls.media_receive_enabled,
            )
          }
        />

        <ToggleCard
          title="Save Media to Cloud"
          description="Simpan media ke storage cloud"
          enabled={controls.media_save_to_cloud}
          locked={isFeatureLocked("media_save_to_cloud")}
          requiredPackage="Premium"
          onToggle={() =>
            !isFeatureLocked("media_save_to_cloud") &&
            updateControl(
              "media_save_to_cloud",
              !controls.media_save_to_cloud,
            )
          }
        />

        <ToggleCard
          title="Send Media Back"
          description="AI bisa mengirim kembali media"
          enabled={controls.media_send_enabled}
          locked={isFeatureLocked("media_send_enabled")}
          requiredPackage="Pro"
          onToggle={() =>
            !isFeatureLocked("media_send_enabled") &&
            updateControl(
              "media_send_enabled",
              !controls.media_send_enabled,
            )
          }
        />

        <ToggleCard
          title="Confirm Before Save"
          description="Minta konfirmasi sebelum simpan media"
          enabled={controls.media_confirm_before_save}
          locked={isFeatureLocked("media_confirm_before_save")}
          requiredPackage="Premium"
          onToggle={() =>
            !isFeatureLocked("media_confirm_before_save") &&
            updateControl(
              "media_confirm_before_save",
              !controls.media_confirm_before_save,
            )
          }
        />
      </div>
    </section>
  );
}
