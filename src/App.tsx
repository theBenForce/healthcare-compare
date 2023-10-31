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
import { EntityList } from './components/EntityList';
import { Sidebar } from './components/Sidebar';
import { EditCategoryPage } from './pages/editCategory';
import { EditPersonPage } from './pages/personEdit';
import { EditPlanPage } from './pages/editPlan';
import { SummaryPage } from './pages/summary';
import { TableNames, useDB } from './providers/db';
import { useAppContext } from './providers/state';
import { DownloadRounded } from '@mui/icons-material';


function App() {
  const [isDrawerOpen, setDrawerOpen] = React.useState(false);
  const { title } = useAppContext();
  const { db } = useDB();

  const downloadConfig = async () => {
    const storeNames = db?.objectStoreNames ?? [];
    const config = {} as Record<string, Array<unknown>>;

    for (const storeName of storeNames) {
      const data = await db?.getAll(storeName);
      config[storeName] = data ?? [];
    }

    const configBlob = new Blob([JSON.stringify(config)], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(configBlob);
    link.download = 'healthcare-compare.json';
    link.click();
  }

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
            <IconButton color='inherit' onClick={downloadConfig}>
              <DownloadRounded />
            </IconButton>
          </Toolbar>
        </AppBar>


        <Sidebar open={isDrawerOpen} onClose={() => setDrawerOpen(false)} />


        <Container sx={{ flexGrow: 1, mt: 2 }}>
          <Routes>
            <Route path='/' element={<SummaryPage />} />


            <Route path='plan'>
              <Route path='/plan' element={<EntityList table={TableNames.PLANS} title='Plans' />} />
              <Route path="/plan/:planId" element={<EditPlanPage />} />
            </Route>

            <Route path='person'>
              <Route path='/person' element={<EntityList table={TableNames.PEOPLE} title='People' />} />
              <Route path="/person/:personId" element={<EditPersonPage />} />
            </Route>

            <Route path='category'>
              <Route path='/category' element={<EntityList table={TableNames.CATEGORIES} title='Categories' />} />
              <Route path="/category/:id" element={<EditCategoryPage />} />
            </Route>
          </Routes>
        </Container>
      </Router>
    </Box>
  )
}

export default App
