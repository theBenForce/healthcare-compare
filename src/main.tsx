import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { WithDB } from './providers/db.tsx'
import CssBaseline from '@mui/material/CssBaseline';
import { WithAppContext } from './providers/state.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WithAppContext>
      <CssBaseline>
        <WithDB>
          <App />
        </WithDB>
      </CssBaseline>
    </WithAppContext>
  </React.StrictMode>,
)
