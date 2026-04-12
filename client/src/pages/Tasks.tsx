import { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Button, Chip, CircularProgress, Stack } from '@mui/material';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';

interface Task {
  id: number;
  title: string;
  description: string | null;
  points: number;
  completed: boolean;
  once: boolean;
  daily: boolean;
  weekly: boolean;
  biweekly: boolean;
  monthly: boolean;
  hidden: boolean;
  timesRepeated: number;
}

const pointsColor = (points: number) => {
  if(points === 1) 
      return 'success';
  if(points === 2) 
      return 'warning';
  return 'error';
};


const TaskActionItem = ({ 
  task, 
  completeTask, 
  removeTask 
}: { 
  task: Task; 
  completeTask: (id: number) => void; 
  removeTask: (id: number) => void; 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (task.completed && isHovered) {
    return (
      <Box 
        sx={{ display: 'flex', justifyContent: 'center' }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => removeTask(task.id)}
          sx={{ mt: 0, width: '200px' }}
        >
          Remove
        </Button>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ display: 'flex', justifyContent: 'center' }}
      onMouseEnter={() => setIsHovered(true)}
    >
      <Button
        variant={task.completed ? 'outlined' : 'contained'}
        disabled={task.completed}
        onClick={() => completeTask(task.id)}
        size="small"
        sx={{ 
          mt: 0, 
          width: '200px',
          // Allows the Box to detect mouse hover even when button is disabled
          '&.Mui-disabled': { pointerEvents: 'none' } 
        }}
      >
        {task.completed ? 'Done ✓' : 'Complete'}
      </Button>
    </Box>
  );
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshTasks } = useTaskContext();

  useEffect(() => {
    const initializeTasks = async () => {
      setLoading(true);
      try {
        try {
          await api.patch('/tasks/delete');
        } catch (e) {
          console.warn("Cleanup failed, but moving on to fetch:", e);
        }
        const res = await api.get('/tasks');
        setTasks(res.data);
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeTasks();
  }, []);

  const completeTask = async (taskId: number) => {
      await api.patch(`/tasks/${taskId}/complete`);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: true } : t));
  };

  const removeTask = async (taskId: number) => {
      try {
          await api.patch(`/tasks/${taskId}/hide`); 
          setTasks(tasks.filter(t => t.id !== taskId));
      } catch (err) {
          console.error("Failed to remove task:", err);
      }
  };

  const taskBubble = (task: Task) => {
    if (task.hidden) {
      return null;
    } else {
      return (
      <Paper 
        key={task.id} 
        elevation={1} 
        sx={{ p: 2, mb: 2 }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            gap: 2,
            mb: 2
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 , textAlign: 'left'}}>
            <Typography 
              sx={{ overflowWrap: 'break-word', wordBreak: 'break-word' }} 
              fontWeight="bold"
            >
              {task.title}
            </Typography>
            
            <Typography 
              sx={{ overflowWrap: 'break-word', wordBreak: 'break-word' }} 
              variant="body2" 
              color="text.secondary"
            >
              {task.description}
            </Typography>
          </Box>
          
          <Chip 
            label={`${(task.once ? "Once" : task.daily ? "Daily" : task.weekly ? "Weekly" : task.biweekly ? "Biweekly" : task.monthly ? "Monthly" : "Unknown")}`} 
            color={pointsColor(task.points)} 
            sx={{ flexShrink: 0 }}
          />

          <Chip 
            label={`${task.points} pts`} 
            color={pointsColor(task.points)} 
            sx={{ flexShrink: 0 }}
          />
        </Box>

        <TaskActionItem 
          task={task} 
          completeTask={completeTask} 
          removeTask={removeTask} 
        />
      </Paper>
      )}
  };

  const determineDisplay = () => {
      const visibleTasks = tasks.filter(t => !t.hidden);

      if (visibleTasks.length === 0) {
        return (
          <Button
            onClick={() => navigate('/TaskCreation')}
            fullWidth
            variant="contained"
          >
            Add Task
          </Button>
        );
      }
      return visibleTasks.map(task => taskBubble(task));
    };

  if (loading) return <CircularProgress />;
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxHeight: '80vh', overflow: 'auto' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Tasks</Typography>
          </Box>
          {determineDisplay()}
        </Paper>
    </Container>
  );
}