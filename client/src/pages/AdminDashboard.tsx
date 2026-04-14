import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface AdminGroup {
  id: number;
  title: string;
  allnames: string[];
  userids: number[];
  creatorId: number | null;
  createdAt: string | null;
}

type PendingDeleteAction =
  | { type: 'user'; target: AdminUser }
  | { type: 'group'; target: AdminGroup };

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteAction | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const showError = (message: string) => {
    setError(message);
    setSnackbarOpen(true);
  };

  const loadUsers = async () => {
    const response = await api.get('/admin/users');
    setUsers(response.data);
  };

  const loadGroups = async () => {
    const response = await api.get('/admin/groups');
    setGroups(response.data);
  };

  const loadDashboardData = async () => {
    try {
      await Promise.all([loadUsers(), loadGroups()]);
      setError(null);
    } catch {
      showError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const handleToggleAdmin = async (targetUser: AdminUser) => {
    try {
      await api.patch(`/admin/users/${targetUser.id}/admin-status`);
      await loadUsers();
    } catch {
      showError('Failed to update admin status.');
    }
  };

  const deleteUser = async (targetUser: AdminUser) => {
    try {
      await api.delete(`/admin/users/${targetUser.id}`);
      await loadDashboardData();
    } catch {
      showError('Failed to delete user.');
    }
  };

  const deleteGroup = async (targetGroup: AdminGroup) => {
    try {
      await api.delete(`/admin/groups/${targetGroup.id}`);
      await loadGroups();
      setError(null);
    } catch {
      showError('Failed to delete group.');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    if (pendingDelete.type === 'user') {
      await deleteUser(pendingDelete.target);
    } else {
      await deleteGroup(pendingDelete.target);
    }

    setPendingDelete(null);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">Admin Dashboard</Typography>
          {error && <Typography color="error">{error}</Typography>}
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((targetUser) => (
                <TableRow key={targetUser.id}>
                  <TableCell>{targetUser.id}</TableCell>
                  <TableCell>{targetUser.username}</TableCell>
                  <TableCell>{targetUser.email}</TableCell>
                  <TableCell>{targetUser.isAdmin ? 'Admin' : 'User'}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleToggleAdmin(targetUser)}
                        disabled={currentUser?.id === targetUser.id}
                      >
                        {targetUser.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="contained"
                        onClick={() => setPendingDelete({ type: 'user', target: targetUser })}
                        disabled={currentUser?.id === targetUser.id}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5">Groups</Typography>
          <Button variant="outlined" onClick={() => void loadGroups()}>
            Refresh
          </Button>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>Creator ID</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((targetGroup) => (
                <TableRow key={targetGroup.id}>
                  <TableCell>{targetGroup.id}</TableCell>
                  <TableCell>{targetGroup.title}</TableCell>
                  <TableCell>{targetGroup.allnames.join(', ') || '-'}</TableCell>
                  <TableCell>{targetGroup.creatorId ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="error"
                      variant="contained"
                      onClick={() => setPendingDelete({ type: 'group', target: targetGroup })}
                    >
                      Delete Group
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete?.type === 'user'
              ? `Delete user ${pendingDelete.target.username}? This cannot be undone.`
              : `Delete group ${pendingDelete?.target.title}? This cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => void confirmDelete()}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" variant="filled" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}
