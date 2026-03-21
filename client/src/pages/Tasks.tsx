import { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Task {
    id: number;
    title: string;
    description: string | null;
    points: number;
}

const pointsColor = (points: number) => {
    if(points ===1) 
        return 'success';
    if(points===2) 
        return 'warning';
    return 'error';
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tasks')
      .then(res => setTasks(res.data))
      .finally(() => setLoading(false));
  }, []);

  if(loading) 
    return <Typography>Loading Tasks...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Tasks</Typography>
          <Button variant="outlined" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>
        {tasks.map(task => (
          <Paper key={task.id} elevation={1} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography fontWeight="bold">{task.title}</Typography>
              <Typography variant="body2" color="text.secondary">{task.description}</Typography>
            </Box>
            <Chip label={`${task.points} pts`} color={pointsColor(task.points)} />
          </Paper>
        ))}
      </Paper>
    </Container>
  );
}