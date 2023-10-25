import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import React from 'react';

import MenuIcon from '@mui/icons-material/MenuRounded';


import {
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import { SummaryPage } from './pages/summary';
import { Sidebar } from './components/Sidebar';
import { PlanListPage } from './pages/planList';
import { WithPlans } from './providers/plans';


function App() {
  const [isDrawerOpen, setDrawerOpen] = React.useState(false);

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
            <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'left' }}>Healthcare Compare</Typography>
          </Toolbar>
        </AppBar>


        <Sidebar open={isDrawerOpen} onClose={() => setDrawerOpen(false)} />


        <Container sx={{ flexGrow: 1, mt: 2 }}>
          <Routes>
            <Route path='/' element={<SummaryPage />} />


            <Route path='plan'>
              <Route path='/plan' element={<WithPlans><PlanListPage /></WithPlans>} />
            </Route>
          </Routes>
        </Container>
      </Router>
    </Box>
  )
}

export default App
