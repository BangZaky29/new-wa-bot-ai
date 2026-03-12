import type { ReactNode } from "react";
import type { AIControls } from "../../types";

export interface SectionProps {
  controls: AIControls;
  updateControl: <K extends keyof AIControls>(key: K, value: AIControls[K]) => void;
  isFeatureLocked: (featureKey: string) => boolean;
  userFeatures: any;
  lockedByPackage: (key: string, required: string) => ReactNode;
}
