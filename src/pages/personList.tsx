import React from 'react';
import { usePeople } from '../providers/people';
import { Card, CardActions, CardHeader, IconButton, Stack, useTheme } from '@mui/material';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/AddRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../providers/state';

export const PeopleListPage: React.FC = () => {
  const { people, create } = usePeople();
  const theme = useTheme();
  const navigate = useNavigate();
  const { setTitle } = useAppContext();

  React.useEffect(() => {
    setTitle('People');
  }, [setTitle]);

  const onCreatePerson = async () => {
    const personId = await create();
    navigate(`/person/${personId}`);
  };

  return <Stack spacing={2}>
    {people.map(person => (<Card key={person.id}>
      <CardHeader title={person.name} />
      <CardActions>
        <IconButton onClick={() => navigate(`/person/${person.id}`)}>
          <EditIcon />
        </IconButton>
        {/* <IconButton onClick={() => onDeletePlan(plan.id)}>
          <DeleteIcon />
        </IconButton> */}
      </CardActions>
    </Card>))}

    <Fab onClick={onCreatePerson} sx={{ position: 'fixed', bottom: theme.spacing(2), right: theme.spacing(2) }}>
      <AddIcon />
    </Fab>
  </Stack>;
}