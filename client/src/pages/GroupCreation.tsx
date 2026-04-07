import React, { use, useState } from 'react';
import { Container, Box, Paper, Typography, TextField, Button, Fab } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Create } from '@mui/icons-material';

export default function GroupCreation() {
  const [title, setTitle] = useState('New Group');
  const [username, setUsername] = useState('');
  const [usernamestring, setUsernamestring] = useState('');
  const [usersids, setUsers] = useState<number[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      
      if (!token) {
        alert("No authentication token found. Not Logged In.");
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
        alert("User already added to the group.");
        return;
      }
      
      setUsers((prevUsers) => [...prevUsers, userData.id])
      setUsernamestring((prev) => prev ? `${prev}, ${username}` : username);
      setUsername('');

    } catch (err) {
      console.error(err);
      alert("Error adding user to group.");
    }
  };

const handleCreateGroup = async (e: React.FormEvent) => {
  e.preventDefault();
  try {

    if(usersids.length === 0) {
        return;
    }

    if (title === '') {
        alert("Group title cannot be empty.");
        return;
    }

    const tokenresponse = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const currentUserId = tokenresponse.data.id;
    const finalUsersForPayload = [...usersids, currentUserId];

    await api.post('/groups', {
      allnames: usernamestring,
      title,
      userids: finalUsersForPayload 
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setTitle('');
    setUsers([]);
    setUsernamestring(''); 
    setUsername('');

    navigate('/GroupCreation');
    
  } catch (err) {
    console.error(err);
  }
};

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxHeight: '80vh', overflow: 'auto' }}>
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
            value = {usernamestring}
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
    </Container>
  );
}