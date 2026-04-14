import React, { useState } from 'react'
import { Container, Box, Paper, Typography, TextField, Button, Snackbar, Alert } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      await api.post('auth/register', {
        username,
        password,
        email
      });

      navigate('/login');
    }catch (err) {
        setErrorMessage('Registration failed.')
        setSnackbarOpen(true)
    }
  }

  return (
    <>
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3d4535',
        px: 2,
        py: { xs: 3, sm: 4 },
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2.5, sm: 4 },
              width: '100%',
              maxWidth: 420,
              borderRadius: 2,
              boxSizing: 'border-box',
            }}
          >
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
    </Box>
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
    </>
  )
}

export default App
