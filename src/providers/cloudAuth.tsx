/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TokenResponse, googleLogout, useGoogleLogin } from '@react-oauth/google';
import Axios from 'axios';
import React, { PropsWithChildren } from 'react';
import { AuthToken } from '../types/authToken.dto';
import { Logger } from '../util/logger';
import { useFlag } from './featureFlags';


export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

interface CloudAuthContextInterface {
  authToken: AuthToken | null;
  profile: UserProfile | null;
  signOut: () => void;
  signIn: (response: Partial<TokenResponse>) => void;
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
  const [authToken, setAuthToken] = React.useState<AuthToken | null>(null);
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


  const onTokenResponse = (response: TokenResponse) => {
    const authToken = AuthToken.parse(response);
    setAuthToken(authToken);
    localStorage.setItem('authToken', JSON.stringify(authToken));
  };


  const loginWithGoogle = useGoogleLogin({
    flow: 'implicit',
    onSuccess: onTokenResponse,
    onError(errorResponse) {
      Logger.error(`Error logging in with Google: ${JSON.stringify(errorResponse, null, 2)}`);
    },
    onNonOAuthError(nonOAuthError) {
      Logger.error(`Non OAuth Error logging in with Google: ${JSON.stringify(nonOAuthError, null, 2)}`);
    },
    scope: SCOPE.join(' '),
    prompt: 'consent',
    error_callback(nonOAuthError) {
      Logger.error(`Non OAuth Error logging in with Google: ${JSON.stringify(nonOAuthError, null, 2)}`);
    },
  });

  React.useEffect(() => {
    if (!loginWithGoogle || !authToken) return;
    const expiresAt = authToken?.expires_at ?? 0;

    Logger.info(`Checking if auth token is expired (${new Date(expiresAt).toLocaleString()} - ${new Date(Date.now()).toLocaleString()} = ${expiresAt - Date.now()})`);
    if (expiresAt > Date.now()) return;

    Logger.info(`Refreshing auth token...`);

    loginWithGoogle();
  }, [authToken, loginWithGoogle]);

  React.useEffect(() => {
    if (!syncEnabled) return;
    const auth = JSON.parse(localStorage.getItem('authToken') ?? 'null');
    const profile = JSON.parse(localStorage.getItem('profile') ?? 'null');

    if (profile) {
      Logger.info(`Setting profile from local storage: ${profile.name}`);
      setProfile(profile);
    }

    if (auth?.access_token) {
      Logger.info(`Setting auth token from local storage`);
      setAuthToken(auth);
    }
  }, [loginWithGoogle, syncEnabled]);

  const signOut = () => {
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('profile');
    googleLogout();

    setProfile(null);
  };

  const signIn = () => {
    loginWithGoogle({
      prompt: 'select_account'
    });
  };

  return <cloudAuthContext.Provider value={{ authToken, signOut, signIn, profile }} children={children} />;
}