import React, { useState } from 'react'
import axios from 'axios'
import { Container, Box, Paper, Typography, TextField, Button } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      const response = await api.post('auth/login', {
        username,
        password
      });

      const { token } = response.data;
      localStorage.setItem('token', token);

      localStorage.setItem('token', token);
      localStorage.setItem('username', response.data.user.username);
      navigate('/dashboard');
    }catch (err) {
        alert("Login failed.")
    }
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: 2 }}>
          <Box component="img" src="/src/assets/venture-logo.svg" sx={{ width: '100%', mb: 2 }} />
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, bgcolor: '#1976d2' }}
            >
              Sign In
            </Button>
          </form>
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
                      Don't have an account? <Link to="/register">Register</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default App
