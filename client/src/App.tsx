import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Login from './pages/Login';
import Register from "./pages/Register"
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Tasks from './pages/Tasks';
import './App.css'

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  const themeOptions = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1b5e20',
      },
      secondary: {
        main: '#00bfa5',
      },
      background: {
        default: '#dcedc8',
        paper: '#f1f8e9',
      },
    },
    shape: {
      borderRadius: 20,
    },
    typography: {
      fontFamily: 'Rethink Sans',
      fontWeightRegular: 500,
    },
  });

  return (
    <BrowserRouter>
      <ThemeProvider theme={themeOptions}>
      <Routes>
        <Route 
          path="/login" 
          element={<Login />} />

        <Route 
          path="/register" 
          element={<Register />} />
        
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />

        <Route 
          path="/leaderboard"
          element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" />} />

        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />

        <Route
          path="/tasks"
          element={isAuthenticated ? <Tasks /> : <Navigate to="/login" />} />
          
      </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;