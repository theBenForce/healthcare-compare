import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { WithDB } from './providers/db.tsx'
import CssBaseline from '@mui/material/CssBaseline';
import { WithAppContext } from './providers/state.tsx';
import * as Sentry from "@sentry/react";
import theme from './theme';
import './i18n.ts';
import { ThemeProvider } from '@mui/material/styles';
import { WithCloudAuth } from './providers/cloudAuth.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { WithCloudSync } from './providers/cloudSync.tsx';
import { WithFeatureFlags } from './providers/featureFlags.tsx';


const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const sentry_dsn = import.meta.env.VITE_SENTRY_DSN;

Sentry.init({
  dsn: sentry_dsn,
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ["localhost", /^https:\/\/healthcare-compared\.com/],
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 0.1, // Capture 10% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});


ReactDOM.createRoot(document.getElementById('root')!).render(
  <WithFeatureFlags>
    <GoogleOAuthProvider clientId={client_id}>
      <React.StrictMode>
        <WithCloudAuth>
          <WithAppContext>
            <ThemeProvider theme={theme}>
              <CssBaseline>
                <WithDB>
                  <WithCloudSync>
                    <App />
                  </WithCloudSync>
                </WithDB>
              </CssBaseline>
            </ThemeProvider>
          </WithAppContext>
        </WithCloudAuth>
      </React.StrictMode>
    </GoogleOAuthProvider>
  </WithFeatureFlags>,
)
