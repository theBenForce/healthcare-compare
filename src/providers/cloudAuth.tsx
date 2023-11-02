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
    if (!authToken) return;

    Axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json'
        },
        params: {
          // access_token: authToken
        }
      })
      .then((res) => {
        console.dir(res.data);
        setProfile(res.data);
      })
      .catch((err) => console.log(err));

  }, [authToken]);


  const responseMessage = (response: Omit<TokenResponse, 'error' | 'error_description' | 'error_uri'>) => {
    setAuthToken(response.access_token);

    localStorage.setItem('authToken', JSON.stringify(response.access_token));
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: responseMessage,
    scope: SCOPE.join(' '),
    prompt: 'none'
  })

  useGoogleOneTapLogin({
    onSuccess(response) {
      loginWithGoogle({
        hint: response.credential
      })
    }
  })

  React.useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('authToken') ?? 'null');

    if (auth) {
      setAuthToken(auth.access_token);
    }
    gapi.load('client', () => {
      gapi.client.load('drive', 'v3', () => {
        setDrive(gapi.client.drive);
      });
    });
  }, []);

  const signIn = () => {
    loginWithGoogle();
  };

  const signOut = () => {
    googleLogout();
  };

  return <cloudAuthContext.Provider value={{ authToken, signOut, signIn, profile }} children={children} />;
}