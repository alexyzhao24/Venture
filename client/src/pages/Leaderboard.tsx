import { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface LeaderboardEntry {
  id: number;
  username: string;
  _count: {
    tasks: number;
  };
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/leaderboard');
        setEntries(response.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Leaderboard</Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Rank</strong></TableCell>
              <TableCell><strong>User</strong></TableCell>
              <TableCell align="right"><strong>Tasks Completed</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry, i) => (
              <TableRow key={entry.id} sx={{ backgroundColor: i === 0 ? 'rgba(255, 215, 0, 0.08)' : 'inherit' }}>
                <TableCell>{medals[i] ?? i + 1}</TableCell>
                <TableCell>{entry.username}</TableCell>
                <TableCell align="right">{entry._count.tasks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}