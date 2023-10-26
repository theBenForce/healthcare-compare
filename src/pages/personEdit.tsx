import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePeople } from '../providers/people';
import { PersonSchema } from '../types/person.dto';
import { Fab, LinearProgress, Stack, TextField, Typography, useTheme } from '@mui/material';
import { useAppContext } from '../providers/state';

import SaveIcon from "@mui/icons-material/SaveRounded";

export const EditPersonPage: React.FC = () => {
  const { get, save } = usePeople();
  const { personId } = useParams();
  const [person, setPerson] = React.useState<PersonSchema | null>(null);
  const { setTitle } = useAppContext();
  const theme = useTheme();
  const navigate = useNavigate();

  React.useEffect(() => {
    setTitle('Edit Person');
  }, [setTitle]);

  React.useEffect(() => {
    if (!personId) return;

    get(personId)
      .then(person => setPerson(person));
  }, [get, personId]);

  if (!person) {
    return <Stack spacing={2}>
      <Typography variant="h6">Loading...</Typography>
      <LinearProgress />
    </Stack>;
  }

  const onSave = async () => {
    await save(person);
    navigate('/person');
  };

  return <Stack spacing={2}>
    <TextField fullWidth label="Name" value={person?.name} onChange={(event) => setPerson(person => ({ ...person, name: event.target.value }))} />


    <Fab onClick={onSave} sx={{ position: 'fixed', bottom: theme.spacing(2), right: theme.spacing(2) }}>
      <SaveIcon />
    </Fab>
  </Stack>;
}