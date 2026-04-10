import { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress, Fab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLocation, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../api/axios';

interface LeaderboardEntry {
  id: number;
  username: string;
  points: number;
  tasksCompleted: number;
}

export default function Leaderboard() {
  const { userids, timeframe } = useParams<{ userids: string; timeframe: string }>();
  const location = useLocation();
  const groupTitle = location.state?.groupTitle || "Group";
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get(`/leaderboard/${userids}/${timeframe}`);
        setEntries(response.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

  if (userids && timeframe) fetchLeaderboard();
  }, [userids, timeframe]);

  const medals = ['🥇', '🥈', '🥉'];

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">{groupTitle} Leaderboard</Typography>
          <Fab color="primary" aria-label="view" size="small" onClick={() => navigate('/ViewGroups')}>
            <ArrowBackIcon />
          </Fab>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Rank</strong></TableCell>
              <TableCell><strong>User</strong></TableCell>
              <TableCell align="right"><strong>Points</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry, i) => (
              <TableRow key={entry.id} sx={{ backgroundColor: i === 0 ? 'rgba(255, 215, 0, 0.08)' : 'inherit' }}>
                <TableCell>{medals[i] ?? i + 1}</TableCell>
                <TableCell>{entry.username}</TableCell>
                <TableCell align="right">{entry.points} pts</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}