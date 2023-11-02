/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TokenResponse, googleLogout, useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import React, { PropsWithChildren } from 'react';
import Axios from 'axios';


export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

interface CloudAuthContextInterface {
  authToken: string | null;
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
  'https://www.googleapis.com/auth/drive.appdata'
];

export const WithCloudAuth: React.FC<PropsWithChildren> = ({ children }) => {
  const [authToken, setAuthToken] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [drive, setDrive] = React.useState<typeof gapi.client.drive | null>(null);

  React.useEffect(() => {
    if (!authToken || profile) return;

    Axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json'
        }
      })
      .then((res) => {
        console.dir(res.data);
        setProfile(res.data);
        localStorage.setItem('profile', JSON.stringify(res.data));
      })
      .catch((err) => console.log(err));

  }, [authToken, profile]);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (response: Omit<TokenResponse, 'error' | 'error_description' | 'error_uri'>) => {
      setAuthToken(response.access_token);

      localStorage.setItem('authToken', JSON.stringify(response));
    },
    scope: SCOPE.join(' '),
    prompt: 'none'
  })

  useGoogleOneTapLogin({
    disabled: authToken !== null,
    onSuccess(response) {
      loginWithGoogle({
        hint: response.credential
      })
    }
  })

  React.useEffect(() => {
    if (!drive || !authToken) return;

    drive.files.list({
      access_token: authToken,
      spaces: 'appDataFolder',
      fields: 'nextPageToken, files(id, name)',
    }).then((res) => {
      console.dir(res);
    });
  }, [authToken, drive]);

  React.useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('authToken') ?? 'null');
    const profile = JSON.parse(localStorage.getItem('profile') ?? 'null');
    if (profile) {
      console.info(`Setting profile from local storage: ${profile.name}`);
      setProfile(profile);
    }

    if (auth?.access_token) {
      console.info(`Setting auth token from local storage`);
      setAuthToken(auth.access_token);
    }
    // Initializes the client with the API key and the Translate API.
    // @ts-ignore
    gapi.client.init({
      'apiKey': import.meta.env.VITE_GOOGLE_API_KEY,
      'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).then(function () {
      console.info(`Drive API Loaded!`)
      setDrive(gapi.client.drive);
    });
  }, []);

  const signIn = () => {
    loginWithGoogle();
  };

  const signOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('profile');
    googleLogout();

    setProfile(null);
    setAuthToken(null);
  };

  return <cloudAuthContext.Provider value={{ authToken, signOut, signIn, profile }} children={children} />;
}