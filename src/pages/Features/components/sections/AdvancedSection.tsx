import { ApiKeyManager } from "../../../../ui/components/ApiKeyManager";
import { PromptEditor } from "../../../../ui/components/PromptEditor";
import { ContactManager } from "../../../../ui/components/ContactManager";

export function AdvancedSection() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ApiKeyManager />
      <div className="h-px bg-slate-800/50 w-full" />
      <PromptEditor />
      <div className="h-px bg-slate-800/50 w-full" />
      <ContactManager />
    </div>
  );
}
