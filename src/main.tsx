import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { WithDB } from './providers/db.tsx'
import CssBaseline from '@mui/material/CssBaseline';
import { WithAppContext } from './providers/state.tsx';
import * as Sentry from "@sentry/react";
import theme from './theme.tsx';
import './i18n.ts';
import { ThemeProvider } from '@mui/material';

Sentry.init({
  dsn: "https://070b10feac720ac4e210b8beb5b88fc0@o467164.ingest.sentry.io/4506141410000896",
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
  <React.StrictMode>
    <WithAppContext>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <WithDB>
            <App />
          </WithDB>
        </CssBaseline>
      </ThemeProvider>
    </WithAppContext>
  </React.StrictMode>,
)
