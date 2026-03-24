import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, IconButton, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Dashboard as DashIcon, Checklist as TaskIcon, Leaderboard as TrophyIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const drawerWidth = 240;

export default function MainLayout() {
    const [user, setUser] = useState<{ username: string } | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setUser(response.data);
            } catch (err) {
                console.error("Session expired or invalid");
                navigate('/login')
            }
        };

        fetchUser();
    }, []);

    const menuItems = [
        { text: 'Dashboard', icon: <DashIcon />, path: '/dashboard' },
        { text: 'My Tasks', icon: <TaskIcon />, path: '/tasks' },
        { text: 'Leaderboard', icon: <TrophyIcon />, path: '/leaderboard' },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
            <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'white', color: 'text.primary' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box component="img" src="/src/assets/venture-logo.svg" sx={{ height: '80px' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.username}</Typography>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>J</Avatar>
                    </Box>
                </Toolbar>
            </AppBar>

            <Paper
                sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: { xs: 'block', sm: 'none' }, bgcolor: 'white' }}
                elevation={3}
            >
                <BottomNavigation
                    showLabels
                    value={location.pathname}
                    onChange={(event, newValue) => navigate(newValue)}
                >
                    {menuItems.map((item) => (
                        <BottomNavigationAction label={item.text} value={item.path} icon={item.icon} />
                    ))}

                </BottomNavigation>
            </Paper>

            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    display: { xs: 'none', sm: 'block' },
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none', bgcolor: 'white' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', px: 2, mt: 3 }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    selected={location.pathname === item.path}
                                    sx={{
                                        borderRadius: 3,
                                        '&.Mui-selected': { bgcolor: 'primary.light', color: 'white' }
                                    }}
                                >
                                    <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : 'inherit' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600 }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
                        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 3, color: 'error.main' }}>
                            <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    </Box>
                </Box>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    overflowY: 'auto',
                }}>
                <Outlet />
            </Box>
        </Box>
    );
}