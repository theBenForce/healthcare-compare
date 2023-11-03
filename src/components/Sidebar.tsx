import PeopleIcon from '@mui/icons-material/PeopleRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import PlansIcon from '@mui/icons-material/MedicationRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';

import Drawer from '@mui/material/Drawer';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';
import {
  useNavigate,
  useLocation,
} from 'react-router-dom';


const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface RootMenuRecord {
  path: string;
  name: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const menuItems: Array<RootMenuRecord> = [
  {
    path: '/',
    name: 'Summary',
    icon: <HomeIcon />,
  },
  {
    path: '/plan',
    name: 'Plans',
    icon: <PlansIcon />,
  },
  {
    path: '/person',
    name: 'People',
    icon: <PeopleIcon />,
  },
  {
    path: '/category',
    name: 'Categories',
    icon: <CategoryIcon />,
  },
  {
    disabled: true,
    path: '/settings',
    name: 'Settings',
    icon: <SettingsIcon />
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigateTo = (path: string) => {
    return () => {
      navigate(path);
      onClose();
    };
  };

  return <Drawer anchor="left" open={open} onClose={onClose} >
    <MenuList sx={{ width: drawerWidth }}>
      {menuItems.filter(item => !item.disabled).map((item) => <MenuItem key={item.path} onClick={navigateTo(item.path)} selected={location.pathname === item.path} >
        <ListItemIcon>
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.name} />
      </MenuItem>)}
    </MenuList>
  </Drawer>;
};

export default Sidebar;