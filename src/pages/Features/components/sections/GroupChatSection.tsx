import { Users } from "lucide-react";
import { ToggleCard } from "../ToggleCard";
import type { SectionProps } from "../../types";
import { FeatureLockOverlay } from "../../../../ui/components/FeatureLockOverlay";

export function GroupChatSection({
  controls,
  updateControl,
  isFeatureLocked,
  userFeatures,
}: SectionProps) {
  return (
    <section className="glass-card rounded-[2rem] p-8 border border-slate-800/50 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {!userFeatures?.group_chat_enabled && !userFeatures?.is_admin && (
        <FeatureLockOverlay
          featureName="Group Chat"
          requiredPackage="Premium"
          description="Izinkan bot berinteraksi di dalam grup WhatsApp dengan kendali penuh."
        />
      )}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
          <Users className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-white font-black text-lg">Group Chat</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Atur trigger di grup
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">
        Kendalikan bagaimana bot berperilaku ketika diundang ke dalam percakapan Grup WhatsApp. Untuk menghindari bot merespon setiap pesan anggota grup layaknya chat pribadi, Anda dapat mengunci kapan bot boleh menjawab—misalnya, hanya ketika bot di-*tag* (mention), pesannya di-*reply*, atau dipanggil melalui *keyword* tertentu.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ToggleCard
          title="Enable Group Chat"
          description="Aktifkan respon di group"
          enabled={controls.group_chat_enabled}
          locked={isFeatureLocked("group_chat_enabled")}
          onToggle={() =>
            !isFeatureLocked("group_chat_enabled") &&
            updateControl("group_chat_enabled", !controls.group_chat_enabled)
          }
        />

        <ToggleCard
          title="Trigger: Mention"
          description="Respon ketika @mention bot"
          enabled={controls.group_trigger_mention}
          locked={isFeatureLocked("group_trigger_mention")}
          onToggle={() =>
            !isFeatureLocked("group_trigger_mention") &&
            updateControl(
              "group_trigger_mention",
              !controls.group_trigger_mention,
            )
          }
        />

        <ToggleCard
          title="Trigger: Reply"
          description="Respon ketika reply ke bot"
          enabled={controls.group_trigger_reply}
          locked={isFeatureLocked("group_trigger_reply")}
          onToggle={() =>
            !isFeatureLocked("group_trigger_reply") &&
            updateControl(
              "group_trigger_reply",
              !controls.group_trigger_reply,
            )
          }
        />

        <ToggleCard
          title="Trigger: Keyword"
          description="Respon ketika ada keyword (ai/bot)"
          enabled={controls.group_trigger_keyword}
          locked={isFeatureLocked("group_trigger_keyword")}
          onToggle={() =>
            !isFeatureLocked("group_trigger_keyword") &&
            updateControl(
              "group_trigger_keyword",
              !controls.group_trigger_keyword,
            )
          }
        />
      </div>
    </section>
  );
}
