import { Avatar, Divider, ListItemIcon, Menu, MenuItem, useTheme } from '@mui/material';
import React from 'react';
import { useCloudAuth } from '../providers/cloudAuth';
import { Logout } from '@mui/icons-material';

export const AccountMenu: React.FC = () => {
  const { profile, signOut } = useCloudAuth();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onLogout = () => {
    handleClose();
    signOut();
  };

  if (!profile) return null;

  const backupDisplay = profile.name.split(/\s+/).map(word => word[0].toUpperCase()).join('');

  return <>
    <Avatar onClick={handleClick} alt={profile.name} src={profile.picture} sx={{ borderColor: theme.palette.secondary.main, borderWidth: '2px' }}>{backupDisplay}</Avatar>
    <Menu
      anchorEl={anchorEl}
      id="account-menu"
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={onLogout}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  </>;
}