import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import React from 'react';

import MenuIcon from '@mui/icons-material/MenuRounded';

import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';

import { useAppContext } from './providers/state';
import { useFlag } from './providers/featureFlags';
import Stack from '@mui/material/Stack';

import EntityList from './components/EntityList';
import EditCategoryPage from './pages/editCategory';
import EditPlanPage from './pages/editPlan';
import EditPersonPage from './pages/personEdit';
import SettingsPage from './pages/settings';
import SummaryPage from './pages/summary';

const CloudSyncStatus = React.lazy(() => import('./components/CloudSync'));
const AccountMenu = React.lazy(() => import('./components/AccountMenu'));

const Sidebar = React.lazy(() => import('./components/Sidebar'));

function App() {
  const [isDrawerOpen, setDrawerOpen] = React.useState(false);
  const { title } = useAppContext();
  const syncEnabled = useFlag('CLOUD_SYNC');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Router>
        <AppBar position="sticky">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setDrawerOpen(!isDrawerOpen)}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'left' }}>{title}</Typography>
            {syncEnabled && <Stack direction='row' spacing={2}>
              <CloudSyncStatus />
              <AccountMenu />
            </Stack>}
          </Toolbar>
        </AppBar>


        <Sidebar open={isDrawerOpen} onClose={() => setDrawerOpen(false)} />


        <Container sx={{ flexGrow: 1, mt: 2 }}>
          <Routes>
            <Route path='/' element={<SummaryPage />} />


            <Route path='plan'>
              <Route path='/plan' element={<EntityList table='plan' title='Plans' />} />
              <Route path="/plan/:planId" element={<EditPlanPage />} />
            </Route>

            <Route path='person'>
              <Route path='/person' element={<EntityList table='person' title='People' />} />
              <Route path="/person/:personId" element={<EditPersonPage />} />
            </Route>

            <Route path='category'>
              <Route path='/category' element={<EntityList table='category' title='Categories' />} />
              <Route path="/category/:id" element={<EditCategoryPage />} />
            </Route>

            <Route path='/settings' element={<SettingsPage />} />
          </Routes>
        </Container>
      </Router>
    </Box>
  )
}

export default App
