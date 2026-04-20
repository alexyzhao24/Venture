import { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Button, Chip, CircularProgress, Fab, TextField, Snackbar, Alert } from '@mui/material';
import ModeIcon from '@mui/icons-material/Mode';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Group {
    id: number;
    title: string;
    userids: number[] | null;
    allnames: string[] | null;
    createdAt: Date;
    creatorId: number | null;
}

export default function ViewGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState('');
  const [memberInput, setMemberInput] = useState<Record<number, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const showError = (message: string) => {
    setErrorMessage(message);
    setSnackbarOpen(true);
  };

  const loadGroups = async () => {
    const res = await api.get('/groups');
    setGroups(res.data);
  };
    
  useEffect(() => {
    const loadData = async () => {
      try {
        const [meRes] = await Promise.all([
          api.get('/auth/me'),
          loadGroups()
        ]);
        setCurrentUserId(meRes.data.id);
        setCurrentUsername(meRes.data.username);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if(loading) 
    return <CircularProgress />;

   const determineDisplay = () => {
        if (groups.length === 0) {
            return ( 
            <Box>  
            <Typography sx={{ mt: -1, mb: 2}} color="text.secondary">
            No groups available. Create one to Venture Together!
            </Typography>     
            <Button
              onClick={() => navigate('/GroupCreation')}
              fullWidth
              variant="contained"
            >
              Add Group
            </Button>
            </Box>
          );
        }else{
            return ( groups.map(group => (
                <Paper 
                    onClick={() => {
                    // Join all userIDS into a comma separated string for the URL
                    const ids = group.userids?.length ? group.userids.join(',') : '';
                    if (ids) {
                      //navigate to leaderboard for this group, passing title as hidden state
                      navigate(`/leaderboard/${ids}/${group.createdAt}`, { 
                        state: { groupTitle: group.title } // This "carries" the title hiddenly
                      });
                    }
                  }}
                style={{ cursor: 'pointer' }}
                key={group.id} 
                elevation={1} 
                sx={{ p: 2, mb: 2 }}>
                
                <Box sx={{ textAlign: 'left', width: '100%' }} >
                    <Typography variant="h6" >{"Group: " + group.title}</Typography>
                    <Box sx={{ mt: 1, mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {group.allnames?.map((name) => {
                        const isCreator = group.creatorId !== null && currentUserId === group.creatorId;
                        const isOwnName = name === currentUsername;

                        return (
                          <Chip
                            key={`${group.id}-${name}`}
                            label={name}
                            onDelete={isCreator && !isOwnName ? async (e) => {
                              e.stopPropagation();
                              try {
                                const res = await api.patch(`/groups/${group.id}/members/remove`, { username: name });
                                setGroups((prev) => prev.map((g) => (g.id === group.id ? res.data : g)));
                              } catch (error: any) {
                                showError(error?.response?.data?.message || 'Failed to remove member');
                              }
                            } : undefined}
                          />
                        );
                      })}
                    </Box>

                    {group.creatorId === currentUserId && (
                      <Box
                        sx={{ display: 'flex', gap: 1, mb: 2 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TextField
                          size="small"
                          label="Username"
                          value={memberInput[group.id] ?? ''}
                          onChange={(e) => setMemberInput((prev) => ({ ...prev, [group.id]: e.target.value }))}
                        />
                        <Button
                          variant="contained"
                          onClick={async () => {
                            const username = (memberInput[group.id] ?? '').trim();
                            if (!username) return;

                            try {
                              const res = await api.patch(`/groups/${group.id}/members/add`, { username });
                              setGroups((prev) => prev.map((g) => (g.id === group.id ? res.data : g)));
                              setMemberInput((prev) => ({ ...prev, [group.id]: '' }));
                            } catch (error: any) {
                              showError(error?.response?.data?.message || 'Failed to add member');
                            }
                          }}
                        >
                          Add Member
                        </Button>
                      </Box>
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  {group.creatorId === currentUserId ? (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await api.delete(`/groups/${group.id}`);
                          setGroups((prev) => prev.filter((g) => g.id !== group.id));
                        } catch (error: any) {
                          showError(error?.response?.data?.message || 'Failed to delete group');
                        }
                      }}
                    >
                      Delete Group
                    </Button>
                  ) : ( // LEAVE button, should stop click from bubbling up to the card's onClick
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent navigation to the leaderboard when clicking Leave
                        api.patch(`/groups/${group.id}/leave`)
                          .then(() => {
                            //remove gruop from the local state to allow UI update quickly
                            setGroups((prev) => prev.filter((g) => g.id !== group.id));
                          })
                          .catch((error: any) => {
                            showError(error?.response?.data?.message || 'Failed to leave group');
                          });
                      }}
                    >
                      Leave
                    </Button>
                  )}
                </Box>
                </Paper>
            )));
        }
    };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Current Groups</Typography>
          <Fab color="primary" aria-label="view" size="small" onClick={() => navigate('/GroupCreation')}>
            <ModeIcon />
          </Fab>
        </Box>
        {determineDisplay()}
      </Paper>
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
    </Container>
  );
}