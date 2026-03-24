import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Login from './pages/Login';
import Register from "./pages/Register"
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Tasks from './pages/Tasks';
import './App.css'
import MainView from './components/MainView';

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={isAuthenticated ? <MainView /> : <Navigate to="/login" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>

          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;