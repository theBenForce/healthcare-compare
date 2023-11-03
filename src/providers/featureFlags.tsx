import React from 'react';

export enum FeatureFlags {
  CLOUD_SYNC = 'CLOUD_SYNC',
}

type FlagKeys = `${FeatureFlags}`;

interface FeatureFlagContextInterface {
  isFeatureEnabled: (feature: FlagKeys) => boolean;
}

const featureFlagContext = React.createContext<FeatureFlagContextInterface>({
  isFeatureEnabled: () => false,
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

  React.useEffect(() => {
    const flags = JSON.parse(localStorage.getItem('featureFlags') ?? '{}');
    setFlags(flags);
  }, []);

  return <featureFlagContext.Provider value={{ isFeatureEnabled }}>
    {children}
  </featureFlagContext.Provider>
}