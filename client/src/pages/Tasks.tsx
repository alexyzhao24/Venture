import { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Button, Chip, CircularProgress } from '@mui/material';
import api from '../api/axios';


interface Task {
  id: number;
  title: string;
  description: string | null;
  points: number;
  completed: boolean;
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

  useEffect(() => {
      api.get('/tasks')
          .then(res => setTasks(res.data))
          .finally(() => setLoading(false));
  }, []);

  const completeTask = async (taskId: number) => {
      await api.post(`/tasks/${taskId}/complete`);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: true } : t));
  };

  if (loading) return <CircularProgress />;
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxHeight: '80vh', overflow: 'auto' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Tasks</Typography>
          </Box>
          {tasks.map(task => (
            <Paper key={task.id} elevation={1} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ textAlign: 'left', width: '100%' }}>
                <Typography fontWeight="bold">{task.title}</Typography>
                <Typography variant="body2" color="text.secondary">{task.description}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip label={`${task.points} pts`} color={pointsColor(task.points)} />
                <Button
                  variant={task.completed ? 'outlined' : 'contained'}
                  disabled={task.completed}
                  onClick={() => completeTask(task.id)}
                  size="small"
                >
                  {task.completed ? 'Done ✓' : 'Complete'}
                </Button>
              </Box>
            </Paper>
          ))}
        </Paper>
    </Container>
  );
}