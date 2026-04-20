import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, IconButton, BottomNavigation, BottomNavigationAction, Paper, Fab, Menu, MenuItem, Badge, Divider } from '@mui/material';
import { Dashboard as DashIcon, Checklist as TaskIcon, Logout as LogoutIcon, Add as AddIcon, Group as GroupsIcon, NotificationsNone as BellIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

export default function MainLayout() {
    const { user, logout } = useAuth();
    const { incompleteTasks } = useTaskContext();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <DashIcon />, path: '/dashboard' },
        { text: 'My Tasks', icon: <TaskIcon />, path: '/tasks' },
        { text: 'Venture Together', icon: <GroupsIcon />, path: '/ViewGroups' },
        { text: 'Add Task', icon: <AddIcon />, path: '/TaskCreation' },
        ...(user?.isAdmin ? [{ text: 'Admin', icon: <AdminIcon />, path: '/admin' }] : []),
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [bellAnchorEl, setBellAnchorEl] = useState<null | HTMLElement>(null);
    const [pageTransitionClass, setPageTransitionClass] = useState('route-transition-enter');
    const open = Boolean(anchorEl);
    const bellOpen = Boolean(bellAnchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleBellClick = (event: React.MouseEvent<HTMLElement>) => setBellAnchorEl(event.currentTarget);
    const handleBellClose = () => setBellAnchorEl(null);

    useEffect(() => {
        // Re-trigger route animation whenever pathname changes.
        setPageTransitionClass('route-transition-enter');
        const id = window.setTimeout(() => setPageTransitionClass('route-transition-enter route-transition-enter-active'), 10);
        return () => window.clearTimeout(id);
    }, [location.pathname]);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
            <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'white', color: 'text.primary' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box component="img" src="/venture-logo.svg" sx={{ height: '80px' }} onClick={() => navigate('/dashboard')} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={handleBellClick}>
                            <Badge badgeContent={incompleteTasks.length} color="error">
                                <BellIcon />
                            </Badge>
                        </IconButton>
                        <Menu
                            anchorEl={bellAnchorEl}
                            open={bellOpen}
                            onClose={handleBellClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            PaperProps={{ sx: { width: 280, maxHeight: 400, overflow: 'auto' } }}
                        >
                            <MenuItem disabled>
                                <Typography variant="body2" fontWeight={600}>Incomplete Tasks</Typography>
                            </MenuItem>
                            <Divider />
                            {incompleteTasks.length === 0 ? (
                                <MenuItem disabled>
                                    <Typography variant="body2" color="text.secondary">All tasks complete! 🎉</Typography>
                                </MenuItem>
                            ) : (
                                incompleteTasks.map(task => (
                                    <MenuItem key={task.id} onClick={() => { navigate('/tasks'); handleBellClose(); }}>
                                        <Typography variant="body2">📋 {task.title}</Typography>
                                    </MenuItem>
                                ))
                            )}
                        </Menu>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.username}</Typography>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }} onClick={handleClick} />
                        <Menu
                            id="long-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem onClick={() => { handleLogout(); handleClose(); }} sx={{ color: 'error.main' }}>
                                <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                                <ListItemText>Logout</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Paper
                sx={{
                    // Mobile-first bottom navigation; desktop uses the left drawer.
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: { xs: 'block', sm: 'none' },
                    bgcolor: 'white',
                    zIndex: (theme) => theme.zIndex.appBar + 2,
                }}
                elevation={3}
            >
                <BottomNavigation
                    showLabels
                    value={location.pathname}
                    onChange={(_, newValue) => navigate(newValue)}
                >
                    {menuItems.slice(0, 3).map((item) => (
                        <BottomNavigationAction key={item.text} label={item.text} value={item.path} icon={item.icon} />
                    ))}
                </BottomNavigation>
                <Box sx={{ position: 'fixed', bottom: 85, right: 16, zIndex: (theme) => theme.zIndex.appBar + 3 }}>
                    <Fab color="primary" aria-label="add" onClick={() => navigate('/TaskCreation')}>
                        <AddIcon />
                    </Fab>
                </Box>
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
                                    sx={{ borderRadius: 3, '&.Mui-selected': { bgcolor: 'primary.light', color: 'white' } }}
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
                    height: '100dvh',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'flex-start',
                    px: { xs: 2, sm: 4 },
                    pt: { xs: '88px', sm: '96px' },
                    pb: { xs: '112px', sm: 4 },
                    overflowY: 'auto',
                    scrollbarGutter: 'stable',
                    background: 'linear-gradient(120deg, #3d4739 0%, #3d4434 52%, #38403a 100%)',
                }}
            >
                <Box
                    className={pageTransitionClass}
                    sx={{
                        width: '100%',
                        maxWidth: 1100,
                        mx: 'auto',
                        my: 'auto',
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}