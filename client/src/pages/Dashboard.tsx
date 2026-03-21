import { Container, Typography, Button, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios'

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUser(response.data);
      } catch (err) {
        console.error("Session expired or invalid");
        navigate('/login')
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <Typography>Loading Venture...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Welcome back, {user?.username || "USERNAME"}!</Typography>
          <Box display="flex" gap={2}>
            <Button variant="outlined" onClick={() => navigate('/leaderboard')}>
              Leaderboard
            </Button>
            <Button variant="contained" color="error" onClick={handleLogout}>
              Logout
            </Button>
            <Button variant="outlined" onClick={() => navigate('/tasks')}>
              Tasks
            </Button>
          </Box>
        </Box>
        <Typography sx={{ mt: 2 }} color="text.secondary">
          TODO - tasks and groups!
        </Typography>
      </Paper>
    </Container>
  );
}