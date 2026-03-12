import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api.service";
import { paymentApi } from "../services/payment.api";
import type { AIControls } from "../../types";
import { DEFAULT_AI_CONTROLS } from "../../types";

export function useFeatureControls(userId?: string) {
  const [controls, setControls] = useState<AIControls>(DEFAULT_AI_CONTROLS);
  const [originalControls, setOriginalControls] = useState<AIControls>(
    DEFAULT_AI_CONTROLS,
  );
  const [userFeatures, setUserFeatures] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchControls = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await apiService.getAIControls(userId);
      if (res.success && res.controls) {
        const merged = { ...DEFAULT_AI_CONTROLS, ...res.controls };
        setControls(merged);
        setOriginalControls(merged);
      }
    } catch (err) {
      console.error("Failed to fetch AI controls:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchFeatures = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await paymentApi.getUserFeatures(userId);
      if (res.success) setUserFeatures(res.features);
    } catch (err) {
      console.error("Failed to fetch user features:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchControls();
      fetchFeatures();
    }
  }, [userId, fetchControls, fetchFeatures]);

  const updateControl = useCallback(
    <K extends keyof AIControls>(key: K, value: AIControls[K]) => {
      setControls((prev) => ({ ...prev, [key]: value }));
      setIsDirty(true);
      setSaveError(null);
    },
    [],
  );

  const saveControls = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await apiService.updateAIControls(userId, controls);
      if (res.success) {
        setOriginalControls(controls);
        setIsDirty(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError("Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      setSaveError("Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }, [userId, controls]);

  const discardChanges = useCallback(() => {
    setControls(originalControls);
    setIsDirty(false);
    setSaveError(null);
  }, [originalControls]);

  const isFeatureLocked = useCallback(
    (featureKey: string): boolean => {
      if (!userFeatures || !userFeatures.has_subscription) return true;
      switch (featureKey) {
        case "media_save_to_cloud":
          return !userFeatures.media_save_enabled;
        case "media_send_enabled":
          return !userFeatures.media_send_enabled;
        case "group_chat_enabled":
          return !userFeatures.group_chat_enabled;
        case "group_trigger_keyword":
          return !userFeatures.group_keyword_trigger;
        case "is_proactive_enabled":
          return !userFeatures.proactive_enabled;
        case "proactive_config":
          return !userFeatures.proactive_config_enabled;
        default:
          return false;
      }
    },
    [userFeatures],
  );

  return {
    controls,
    setControls,
    originalControls,
    userFeatures,
    loading,
    saving,
    isDirty,
    saveSuccess,
    saveError,
    fetchControls,
    fetchFeatures,
    updateControl,
    saveControls,
    discardChanges,
    isFeatureLocked,
  };
}
