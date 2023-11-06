import React from 'react';
import { Logger } from '../util/logger';

export enum FeatureFlags {
  CLOUD_SYNC = 'CLOUD_SYNC',
}

type FlagKeys = `${FeatureFlags}`;

interface FeatureFlagContextInterface {
  isFeatureEnabled: (feature: FlagKeys) => boolean;
  setFlagState: (feature: FlagKeys, enabled: boolean) => void;
}

const featureFlagContext = React.createContext<FeatureFlagContextInterface>({
  isFeatureEnabled: () => false,
  setFlagState: () => { },
});

export const useFeatureFlags = () => React.useContext(featureFlagContext);

export const useFlag = (flag: FlagKeys) => {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(flag);
}

export const WithFeatureFlags: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [flags, setFlags] = React.useState<Partial<Record<FeatureFlags, boolean>>>({});

  const isFeatureEnabled = React.useCallback((feature: FlagKeys) => {
    return flags[feature] ?? false;
  }, [flags]);

  const setFlagState = React.useCallback((feature: FlagKeys, enabled: boolean) => {
    setFlags((flags) => ({ ...flags, [feature]: enabled }));
  }, [setFlags]);

  React.useEffect(() => {
    if (!Object.keys(flags).length) return;
    Logger.info(`Saving feature flags`);
    Logger.dir(flags);
    localStorage.setItem('featureFlags', JSON.stringify(flags));
  }, [flags]);

  React.useEffect(() => {
    const flags = JSON.parse(localStorage.getItem('featureFlags') ?? '{}');
    setFlags(flags);
  }, []);

  return <featureFlagContext.Provider value={{ isFeatureEnabled, setFlagState }}>
    {children}
  </featureFlagContext.Provider>
}