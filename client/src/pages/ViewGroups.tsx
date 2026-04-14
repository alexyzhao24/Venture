import { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Button, Chip, CircularProgress, Fab } from '@mui/material';
import ModeIcon from '@mui/icons-material/Mode';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Group {
    id: number;
    title: string;
    userids: number[] | null;
    allnames: string[] | null;
    createdAt: Date;
}

export default function ViewGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
    
  useEffect(() => {
    api.get('/groups')
      .then(res => setGroups(res.data)) 
      .finally(() => setLoading(false));
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
                sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                
                <Box sx={{ textAlign: 'left', width: '100%' }} >
                    <Typography variant="h6" >{"Group: " + group.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{group.allnames?.join(', ')}</Typography>
                </Box>
                {// LEAVE button, should stop click from bubbling up to the card's onClick
                }
                <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={(e) => {
                        e.stopPropagation(); // prevent navigation to the leaderboard when clicking Leave
                        api.patch(`/groups/${group.id}/leave`).then(() => {
                          //remove gruop from the local state to allow UI update quickly
                          setGroups(groups.filter(g => g.id !== group.id));
                        });
                      }}
                    >
                      Leave
                  </Button>
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
    </Container>
  );
}