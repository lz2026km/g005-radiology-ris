import { useState, useEffect, useCallback } from 'react';
import { UserConfig, DEFAULT_CONFIG } from '../config/userConfig';

const STORAGE_KEY = 'g005_user_config';

function loadConfig(): UserConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_CONFIG };
}

export function useUserConfig() {
  const [config, setConfig] = useState<UserConfig>(loadConfig);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = useCallback((partial: Partial<UserConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({ ...DEFAULT_CONFIG });
  }, []);

  const updateField = useCallback(<K extends keyof UserConfig>(key: K, value: UserConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { config, updateConfig, resetConfig, updateField };
}
