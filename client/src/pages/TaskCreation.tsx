import React, { useState } from 'react';
import { Container, Box, Paper, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function TaskCreation() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const navigate = useNavigate();

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    const pointsNum = parseInt(points, 10);

    try {
      if (isNaN(pointsNum) || pointsNum < 0) {
        alert("Points must be a valid non-negative number.");
        return;
      }

      const response = await api.post('/tasks', {
        title,
        description,
        points: pointsNum
      });
       
      setTitle('');
      setDescription('');
      setPoints('');

      navigate('/TaskCreation'); 

    } catch (err) {
      alert("Error creating task. Check Points value and try again.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxHeight: '80vh', overflow: 'auto' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Task Creation</Typography>
        </Box>
        
        <form onSubmit={handleCreateTask}>
          <Typography align="left" variant="h6">Task Title</Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Typography align="left" variant="h6">Task Description</Typography>
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Typography align="left" variant="h6">Task Points</Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Add Task
          </Button>
        </form>
      </Paper>
    </Container>
  );
}