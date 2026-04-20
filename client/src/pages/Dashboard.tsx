import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

interface User {
  id: number;
  username: string;
}

interface Task {
  id: number;
  title: string;
  points: number;
  daily: boolean;
  weekly: boolean;
  biweekly: boolean;
  monthly: boolean;
  once: boolean;
  completed: boolean;
  completedAt: string | null;
  hidden: boolean;
}

interface Group {
  id: number;
  title: string;
  userids: number[] | null;
  createdAt: string | null;
}

interface LeaderboardEntry {
  id: number;
  username: string;
  points: number;
  tasksCompleted: number;
}

interface GroupRankSummary {
  groupId: number;
  title: string;
  rank: number | null;
  totalMembers: number;
  points: number;
}

function recurrenceLabel(task: Task): string {
  if (task.daily) return 'Daily';
  if (task.weekly) return 'Weekly';
  if (task.biweekly) return 'Biweekly';
  if (task.monthly) return 'Monthly';
  if (task.once) return 'Once';
  return 'Task';
}

function nextDueDate(task: Task): Date | null {
  if (task.once) return task.completed ? null : new Date();

  const base = task.completedAt ? new Date(task.completedAt) : new Date();

  const d = new Date(base);
  if (task.daily) d.setDate(d.getDate() + 1);
  else if (task.weekly) d.setDate(d.getDate() + 7);
  else if (task.biweekly) d.setDate(d.getDate() + 14);
  else if (task.monthly) d.setDate(d.getDate() + 30);
  else return null;

  return d;
}

function dueLabel(task: Task): string {
  if (task.once && task.completed) return 'Completed';
  const due = nextDueDate(task);
  if (!due) return 'N/A';
  return due.toLocaleDateString();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groupRanks, setGroupRanks] = useState<GroupRankSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const meRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const me = meRes.data as User;
        setUser(me);

        const [tasksRes, groupsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/groups'),
        ]);

        const fetchedTasks = (tasksRes.data as Task[]).filter((t) => !t.hidden);
        const groups = groupsRes.data as Group[];

        setTasks(fetchedTasks);

        const rankSummaries = await Promise.all(
          groups.map(async (group): Promise<GroupRankSummary> => {
            const ids = group.userids?.join(',') ?? '';
            const timeframe = group.createdAt ? new Date(group.createdAt).toISOString() : new Date(0).toISOString();

            if (!ids) {
              return {
                groupId: group.id,
                title: group.title,
                rank: null,
                totalMembers: 0,
                points: 0,
              };
            }

            const leaderboardRes = await api.get(`/leaderboard/${ids}/${timeframe}`);
            const entries = leaderboardRes.data as LeaderboardEntry[];

            const idx = entries.findIndex((e) => e.id === me.id);
            const meEntry = idx >= 0 ? entries[idx] : null;

            return {
              groupId: group.id,
              title: group.title,
              rank: idx >= 0 ? idx + 1 : null,
              totalMembers: entries.length,
              points: meEntry?.points ?? 0,
            };
          })
        );

        setGroupRanks(rankSummaries);
      } catch (err) {
        console.error('Failed to load dashboard');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const latestThreeTasks = useMemo(
    () => [...tasks].sort((a, b) => b.id - a.id).slice(0, 3),
    [tasks]
  );

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Stack spacing={3}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4">
            Welcome back, {user?.username || 'USERNAME'}!
          </Typography>
          <Typography sx={{ mt: 1 }} color="text.secondary">
            Here is your current snapshot.
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Latest 3 Tasks
          </Typography>
          {latestThreeTasks.length === 0 ? (
            <Typography color="text.secondary">No tasks found.</Typography>
          ) : (
            <Stack spacing={2}>
              {latestThreeTasks.map((task) => (
                <Box key={task.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography fontWeight={600}>{task.title}</Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {task.daily && <Chip size="small" label="Daily" color="success" />}
                      {task.points >= 3 && <Chip size="small" label="High Point" color="warning" />}
                      <Chip size="small" label={`${task.points} pts`} />
                      <Chip size="small" label={`Due: ${dueLabel(task)}`} />
                    </Stack>
                  </Box>
                  <Divider sx={{ mt: 1.5 }} />
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            My Group Ranks
          </Typography>
          {groupRanks.length === 0 ? (
            <Typography color="text.secondary">You are not in any groups yet.</Typography>
          ) : (
            <Stack spacing={1.5}>
              {groupRanks.map((g) => (
                <Box
                  key={g.groupId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography fontWeight={600}>{g.title}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      label={
                        g.rank
                          ? `Rank ${g.rank}/${g.totalMembers}`
                          : `Unranked/${g.totalMembers}`
                      }
                      color={g.rank === 1 ? 'warning' : 'default'}
                    />
                    <Chip size="small" label={`${g.points} pts`} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}