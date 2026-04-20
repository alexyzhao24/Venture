import React, { useEffect, useRef, useState } from 'react';
import { Container, Box, Paper, Typography, TextField, Button, Fab, Snackbar, Alert } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function GroupCreation() {
  const [title, setTitle] = useState('New Group');
  const [username, setUsername] = useState('');
  const [usernamearray, setUsernamearray] = useState<string[]>([]);
  const [usersids, setUsers] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const hasFetched = useRef(false);

  const showError = (message: string) => {
    setErrorMessage(message);
    setSnackbarOpen(true);
  };
  
  useEffect(() => {
    const addme = async () => {
      if(usernamearray.length === 0){
        const me = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers((prevUsers) => [...prevUsers, me.data.id])
        setUsernamearray((prev) => [... prev, me.data.username]);
      }
    }
    if (hasFetched.current) {
      return;
    }
    hasFetched.current = true;
    addme();
  }, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {

      if (!token) {
        showError('No authentication token found. Not logged in.');
        return;
      }
        
        const response = await api.get(`/auth/user/${username}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
        });

      const userData = response.data;
      const isDuplicate = usersids.includes(userData.id);

      if (isDuplicate) {
        showError('User already added to the group.');
        return;
      }
      
      setUsers((prevUsers) => [...prevUsers, userData.id])
      setUsernamearray((prev) => [...prev, username]);
      setUsername('');

    } catch (err) {
      console.error(err);
      showError('Error adding user to group.');
    }
  };

const handleCreateGroup = async (e: React.FormEvent) => {
  e.preventDefault();
  try {

    if (title === '') {
      showError('Group title cannot be empty.');
        return;
    }

    await api.post('/groups', {
      allnames: usernamearray,
      title,
      userids: usersids
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setTitle('');
    setUsers([]);
    setUsernamearray([]);
    setUsername('');

    navigate('/ViewGroups');
    
  } catch (err) {
    console.error(err);
  }
};

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Group Creation</Typography>
          <Fab color="primary" aria-label="view" size="small" onClick={() => navigate('/ViewGroups')}>
            <VisibilityIcon />
          </Fab>
        </Box>
    
          <Typography align="left" variant="h6"> Group Title</Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Box>
            <Typography align="left" variant="h6">Username</Typography>
            <TextField
                margin="normal"
                required
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            
            <Button
              type="button"
              onClick={addUser}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, width: '50%' }}
            >
              Add User
            </Button>
          </Box>

          <Typography align="left" variant="h6">Group Members</Typography>
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={2}
            value = {usernamearray.join(', ')}
            slotProps={{
                input: {
                    readOnly: true,
                },
            }}
          />

          <Button
            type="submit"
            onClick={handleCreateGroup}
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Create Group
          </Button>

      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" variant="filled" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}