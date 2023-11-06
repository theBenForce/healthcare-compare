/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CredentialResponse, TokenResponse, googleLogout, useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import Axios from 'axios';
import React, { PropsWithChildren } from 'react';
import { Logger } from '../util/logger';
import { useFlag } from './featureFlags';


export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

type PersistedToken = TokenResponse & { expires_at: number };

interface CloudAuthContextInterface {
  authToken: PersistedToken | null;
  profile: UserProfile | null;
  signOut: () => void;
  signIn: () => void;
}

const cloudAuthContext = React.createContext<CloudAuthContextInterface>({
  authToken: null,
  profile: null,
  signOut: () => { },
  signIn: () => { },
});

export const useCloudAuth = () => React.useContext(cloudAuthContext);

const SCOPE = [
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.appfolder'
];

export const WithCloudAuth: React.FC<PropsWithChildren> = ({ children }) => {
  const [credential, setCredential] = React.useState<CredentialResponse | null>(null);
  const [authToken, setAuthToken] = React.useState<PersistedToken | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const syncEnabled = useFlag('CLOUD_SYNC');

  React.useEffect(() => {
    if (!authToken?.access_token || profile) return;

    Axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo`, {
        headers: {
          Authorization: `Bearer ${authToken.access_token}`,
          Accept: 'application/json'
        }
      })
      .then((res) => {
        Logger.dir(res.data);
        setProfile(res.data);
        localStorage.setItem('profile', JSON.stringify(res.data));
      })
      .catch((err) => Logger.error(err));

  }, [authToken, profile]);

  const loginWithGoogle = useGoogleLogin({
    flow: 'implicit',
    onSuccess: (response: Omit<TokenResponse, 'error' | 'error_description' | 'error_uri'>) => {
      Logger.info(`Logged in with Google: ${JSON.stringify(response, null, 2)}`);
      const persistedToken = { ...response, expires_at: Date.now() + response.expires_in * 1000 };
      setAuthToken(persistedToken);

      localStorage.setItem('authToken', JSON.stringify(persistedToken));
    },
    onError(errorResponse) {
      Logger.error(`Error logging in with Google: ${JSON.stringify(errorResponse, null, 2)}`);
    },
    onNonOAuthError(nonOAuthError) {
      Logger.error(`Non OAuth Error logging in with Google: ${JSON.stringify(nonOAuthError, null, 2)}`);
    },
    scope: SCOPE.join(' '),
    prompt: 'none',
    hint: credential?.credential,
    error_callback(nonOAuthError) {
      Logger.error(`Non OAuth Error logging in with Google: ${JSON.stringify(nonOAuthError, null, 2)}`);
    },
  });

  React.useEffect(() => {
    if (!credential || !loginWithGoogle) return;
    const expiresAt = authToken?.expires_at ?? 0;

    Logger.info(`Checking if auth token is expired (${new Date(expiresAt).toLocaleString()} - ${new Date(Date.now()).toLocaleString()} = ${expiresAt - Date.now()})`);
    if (expiresAt > Date.now()) return;

    Logger.info(`Refreshing auth token...`);

    loginWithGoogle({
      hint: credential.credential,
    });
  }, [authToken?.expires_at, credential, loginWithGoogle]);

  React.useEffect(() => {
    if (!credential?.credential || authToken) return;

    loginWithGoogle({
      hint: credential.credential,
    })
  }, [authToken, credential?.credential, loginWithGoogle]);

  const oneTapDisabled = React.useMemo(() => {
    const result = !syncEnabled || (authToken?.expires_at ?? 0) > Date.now();
    Logger.info(`One tap disabled: ${result}`);
    return result;
  }, [syncEnabled, authToken?.expires_at]);

  useGoogleOneTapLogin({
    state_cookie_domain: import.meta.env.MODE === 'development' ? 'localhost' : 'healthcare-compared.com',
    disabled: oneTapDisabled,
    onSuccess(response) {
      Logger.info(`Logged in with Google One Tap`)
      if (response.credential) {
        Logger.info(`Saving credential to local storage`);
        localStorage.setItem('googleCredential', JSON.stringify(response));

        // @ts-ignore
        Logger.info(`Google: ${JSON.stringify(window.google ?? {}, null, 2)}`);
      }

      setCredential(response ?? null);
    },
    onError() {
      Logger.error(`Error logging in with Google One Tap`);
    },
  });

  React.useEffect(() => {
    if (!syncEnabled) return;
    const auth = JSON.parse(localStorage.getItem('authToken') ?? 'null');
    const profile = JSON.parse(localStorage.getItem('profile') ?? 'null');
    const googleCredential = JSON.parse(localStorage.getItem('googleCredential') ?? 'null');
    if (profile) {
      Logger.info(`Setting profile from local storage: ${profile.name}`);
      setProfile(profile);
    }

    if (auth?.access_token) {
      Logger.info(`Setting auth token from local storage`);
      setAuthToken(auth);
    }

    if (googleCredential) {
      Logger.info(`Setting credential from local storage`);
      setCredential(googleCredential);
    }
  }, [loginWithGoogle, syncEnabled]);

  const signIn = () => {
    loginWithGoogle();
  };

  const signOut = () => {
    setCredential(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('profile');
    googleLogout();

    setProfile(null);
  };

  return <cloudAuthContext.Provider value={{ authToken, signOut, signIn, profile }} children={children} />;
}