import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Login from './pages/Login';
import Register from "./pages/Register";
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Tasks from './pages/Tasks';
import TaskCreation from './pages/TaskCreation';
import GroupCreation from './pages/GroupCreation';
import ViewGroups from './pages/ViewGroups';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';
import MainView from './components/MainView';
import { TaskProvider } from './context/TaskContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CircularProgress } from '@mui/material';

function AppRoutes() {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={!isAuthenticated ? <Login /> : <Navigate to={user?.isAdmin ? '/admin' : '/dashboard'} />}
            />
            <Route
                path="/register"
                element={!isAuthenticated ? <Register /> : <Navigate to={user?.isAdmin ? '/admin' : '/dashboard'} />}
            />

            <Route element={isAuthenticated ? <TaskProvider><MainView /></TaskProvider> : <Navigate to="/login" />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/leaderboard/:userids/:timeframe" element={<Leaderboard />} />
                <Route path="/TaskCreation" element={<TaskCreation />} />
                <Route path="/GroupCreation" element={<GroupCreation />} />
                <Route path="/ViewGroups" element={<ViewGroups />} />
                <Route
                    path="/admin"
                    element={user?.isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" />}
                />
            </Route>

            <Route
                path="*"
                element={<Navigate to={isAuthenticated ? (user?.isAdmin ? '/admin' : '/dashboard') : '/login'} />}
            />
        </Routes>
    );
}

function App() {
    const themeOptions = createTheme({
        palette: {
            mode: 'light',
            primary: { main: '#1b5e20' },
            secondary: { main: '#00bfa5' },
            background: { default: '#dcedc8', paper: '#f1f8e9' },
        },
        shape: { borderRadius: 20 },
        typography: { fontFamily: 'Rethink Sans', fontWeightRegular: 500 },
    });

    return (
        <BrowserRouter>
            <ThemeProvider theme={themeOptions}>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;