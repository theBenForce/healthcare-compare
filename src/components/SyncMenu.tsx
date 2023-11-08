/* eslint-disable @typescript-eslint/ban-ts-comment */
import Stack from '@mui/material/Stack';
import React from 'react';
import CloudSyncStatus from './CloudSync';
import AccountMenu from './AccountMenu';
import { useCloudAuth } from '../providers/cloudAuth';
import LoginIcon from '@mui/icons-material/LoginRounded';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

// @ts-ignore
import GoogleLoginButton from 'react-social-login-buttons/src/buttons/GoogleLoginButton';

export const SyncMenu: React.FC = () => {

  const { authToken, signIn } = useCloudAuth();
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);

  const onGoogleLogin = () => {
    setShowLoginDialog(false);
    signIn({});
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!authToken) return <>
    <IconButton onClick={() => setShowLoginDialog(true)} title='Login'>
      <LoginIcon />
    </IconButton>


    <Dialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} fullWidth maxWidth='sm'>
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <Stack>
          <GoogleLoginButton onClick={onGoogleLogin} />
        </Stack>
      </DialogContent>
    </Dialog>
  </>;

  return <Stack direction='row' spacing={2}>
    <CloudSyncStatus />
    <AccountMenu />

  </Stack>;

}