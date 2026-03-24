import React, { useState } from 'react'
import axios from 'axios'
import { Container, Box, Paper, Typography, TextField, Button } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      const response = await api.post('auth/register', {
        username,
        password,
        email
      });

      navigate('/login');
    }catch (err) {
        alert("Registration failed.")
    }
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: 2 }}>
          <Box component="img" src="/src/assets/venture-logo.svg" sx={{ width: '100%', mb: 2 }} />
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Register
          </Typography>
          <form onSubmit={handleRegister}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
          </form>
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default App
