import { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Grid, Paper, Stack,
    CircularProgress, Fade, Avatar, Button,
    Chip, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton,
    Tabs, Tab, Card, CardContent, LinearProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider,
    TextField, InputAdornment
} from '@mui/material';
import {
    Dashboard as DashIcon,
    Group as GroupIcon,
    History as LogIcon,
    BugReport as ErrorIcon,
    Storage as SystemIcon,
    Logout as LogoutIcon,
    Refresh as RefreshIcon,
    Shield as ShieldIcon,
    Download as BackupIcon,
    CheckCircle as SuccessIcon,
    Search as SearchIcon
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { adminApi, userApi } from '../../api';

type TabType = 'overview' | 'users' | 'logs' | 'errors' | 'system';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [errors, setErrors] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [selectedError, setSelectedError] = useState<any>(null);
    const [logSearch, setLogSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [s, u, l, e, m] = await Promise.all([
                adminApi.getStats(),
                userApi.getAll(),
                adminApi.getLogs(),
                adminApi.getErrors(),
                adminApi.getMetrics()
            ]);
            setStats(s.data);
            setUsers(u.data);
            setLogs(l.data);
            setErrors(e.data);
            setMetrics(m.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleBackup = async () => {
        try {
            const res = await adminApi.performBackup();
            alert(`Backup Created: ${res.data.fileName}`);
        } catch (e) {
            alert("Backup failed");
        }
    }

    if (loading && !stats) return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress thickness={5} size={60} color="primary" />
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', flexDirection: 'column' }}>
            {/* Header Section */}
            <Box sx={{
                bgcolor: 'primary.main',
                color: 'white',
                pt: 4, pb: 8,
                px: { xs: 2, md: 4 },
                boxShadow: '0 10px 30px rgba(62, 39, 35, 0.2)'
            }}>
                <Container maxWidth="xl">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', letterSpacing: -1, mb: 0.5 }}>
                                Admin Control Panel
                            </Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.8, fontWeight: 500 }}>
                                ระบบบริหารจัดการและควบคุมความปลอดภัย Smart Charcoal
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<BackupIcon />}
                                onClick={handleBackup}
                                sx={{ borderRadius: 10, px: 3, fontWeight: 800 }}
                            >
                                Backup Data
                            </Button>
                            <IconButton onClick={handleLogout} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
                                <LogoutIcon />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* Content Section */}
            <Container maxWidth="xl" sx={{ mt: -6, mb: 6 }}>
                <Paper sx={{
                    borderRadius: 6,
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(62, 39, 35, 0.1)',
                    border: 'none'
                }}>
                    {/* Navigation Tabs */}
                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        sx={{
                            px: 3, pt: 1,
                            borderBottom: '1px solid #EFEBE9',
                            '& .MuiTab-root': { py: 3, fontWeight: 700, fontSize: '0.95rem' }
                        }}
                    >
                        <Tab icon={<DashIcon sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Overview" value="overview" />
                        <Tab icon={<GroupIcon sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Users" value="users" />
                        <Tab icon={<LogIcon sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Activity Logs" value="logs" />
                        <Tab icon={<ErrorIcon sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Error Logs" value="errors" />
                        <Tab icon={<SystemIcon sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="System Metrics" value="system" />
                    </Tabs>

                    <Box sx={{ p: 4, minHeight: '60vh' }}>
                        {activeTab === 'overview' && <OverviewTab stats={stats} fetchData={fetchData} navigate={navigate} />}
                        {activeTab === 'users' && <UsersTab users={users} navigate={navigate} />}
                        {activeTab === 'logs' && <LogsTab logs={logs} search={logSearch} onSearchChange={setLogSearch} />}
                        {activeTab === 'errors' && <ErrorsTab errors={errors} onSelect={setSelectedError} />}
                        {activeTab === 'system' && <SystemTab metrics={metrics} />}
                    </Box>

                    {/* Error Detail Modal */}
                    <Dialog open={!!selectedError} onClose={() => setSelectedError(null)} fullWidth maxWidth="md">
                        <DialogTitle sx={{ fontWeight: 900, color: 'error.main' }}>
                            Error Details
                        </DialogTitle>
                        <Divider />
                        <DialogContent>
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>Error Message</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main', bgcolor: '#fff5f5', p: 2, borderRadius: 2 }}>
                                        {selectedError?.error_message}
                                    </Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>Endpoint</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedError?.method} {selectedError?.endpoint}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>User</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedError?.user_name || 'Anonymous'}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>Time</Typography>
                                        <Typography variant="body2">{new Date(selectedError?.created_at).toLocaleString('th-TH')}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>IP Address</Typography>
                                        <Typography variant="body2">{selectedError?.ip || '-'}</Typography>
                                    </Grid>
                                </Grid>
                                <Divider />
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>Stack Trace</Typography>
                                    <Paper sx={{ p: 2, bgcolor: '#0f172a', color: '#f8fafc', overflow: 'auto', maxHeight: 300, mt: 1 }}>
                                        <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                            {selectedError?.stack_trace || 'No stack trace available'}
                                        </pre>
                                    </Paper>
                                </Box>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <Button onClick={() => setSelectedError(null)} variant="outlined">Close</Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
            </Container>
        </Box>
    );
}

// --- Sub Components ---

function OverviewTab({ stats, fetchData, navigate }: any) {
    const kpiData = [
        { label: 'ผู้ใช้งานระบบ', value: stats?.users || 0, icon: <GroupIcon />, color: '#3E2723' },
        { label: 'เตาเผา', value: stats?.kilns || 0, icon: <SystemIcon />, color: '#2E7D32' },
        { label: 'งานวิจัย', value: stats?.experiments || 0, icon: <LogIcon />, color: '#E65100' },
        { label: 'ผลผลิตรวม', value: `${stats?.charcoalTotal || 0}kg`, icon: <SuccessIcon />, color: '#43A047' },
    ];

    return (
        <Fade in timeout={500}>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>System Overview</Typography>
                    <IconButton onClick={fetchData} color="primary"><RefreshIcon /></IconButton>
                </Box>
                <Grid container spacing={3}>
                    {kpiData.map((kpi, idx) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                            <Card sx={{ bgcolor: '#FDFBF7', border: '1px solid #EFEBE9' }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '24px !important' }}>
                                    <Avatar sx={{ bgcolor: kpi.color, color: 'white', width: 56, height: 56 }}>{kpi.icon}</Avatar>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>{kpi.label}</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 900 }}>{kpi.value}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ mt: 6, p: 4, bgcolor: '#F1F8E9', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <ShieldIcon sx={{ fontSize: 60, color: 'secondary.main' }} />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'secondary.dark' }}>Security Center</Typography>
                        <Typography variant="body2" color="text.secondary">ระบบกำลังทำงานปกติดี ไม่พบความพยายามในการเข้าถึงที่ผิดปกติในช่วง 24 ชม. ที่ผ่านมา</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                        <Button variant="outlined" color="secondary" onClick={() => navigate('/kilns')} sx={{ borderRadius: 4, fontWeight: 700 }}>เตาเผาทั้งหมด</Button>
                        <Button variant="contained" color="secondary" onClick={() => navigate('/master-list')} sx={{ borderRadius: 4, fontWeight: 700 }}>ข้อมูลพันธุ์ไม้</Button>
                    </Stack>
                </Box>
            </Box>
        </Fade>
    );
}

function UsersTab({ users, navigate }: any) {
    return (
        <Fade in timeout={500}>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>User Management</Typography>
                    <Button variant="contained" onClick={() => navigate('/admin/manage-users')} sx={{ borderRadius: 4 }}>Manage Users</Button>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800 }}>Full Name</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u: any) => (
                                <TableRow key={u.user_id}>
                                    <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                                    <TableCell>{u.phone}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={u.role.toUpperCase()}
                                            size="small"
                                            color={u.role === 'admin' ? 'primary' : u.role === 'researcher' ? 'secondary' : 'default'}
                                            sx={{ fontWeight: 900, fontSize: '0.7rem' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: u.is_active ? 'success.main' : 'grey.400' }} />
                                            <Typography variant="body2">{u.is_active ? 'Active' : 'Disabled'}</Typography>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Fade>
    );
}

function LogsTab({ logs, search, onSearchChange }: any) {
    const filteredLogs = logs.filter((l: any) =>
        (l.user_name || 'System').toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.target.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Fade in timeout={500}>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Activity Logs</Typography>
                    <TextField
                        placeholder="Search Logs..."
                        size="small"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 4, bgcolor: '#FDFBF7', minWidth: 250 }
                            }
                        }}
                    />
                </Box>
                <TableContainer sx={{ maxHeight: 500 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#FDFBF7' }}>
                                <TableCell sx={{ fontWeight: 800 }}>Timestamp</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Action</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Target</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>IP Address</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLogs.map((l: any) => (
                                <TableRow key={l.id} hover>
                                    <TableCell sx={{ fontSize: '0.85rem' }}>{new Date(l.created_at).toLocaleString('th-TH')}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{l.user_name || 'System'}</TableCell>
                                    <TableCell>
                                        <Chip label={l.action} size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{l.target}</TableCell>
                                    <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{l.ip || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Fade>
    );
}

function ErrorsTab({ errors, onSelect }: any) {
    return (
        <Fade in timeout={500}>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Error Logs (Monitoring)</Typography>
                {errors.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F1F8E9', borderRadius: 4 }}>
                        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
                        <Typography sx={{ fontWeight: 700 }}>Excellent! No system errors found.</Typography>
                    </Box>
                ) : (
                    <TableContainer sx={{ maxHeight: 500 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#FFF3E0' }}>
                                    <TableCell sx={{ fontWeight: 800 }}>Timestamp</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Message</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Endpoint</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }} align="right">Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {errors.map((e: any) => (
                                    <TableRow key={e.id} hover>
                                        <TableCell sx={{ fontSize: '0.85rem' }}>{new Date(e.created_at).toLocaleString('th-TH')}</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>{e.error_message}</TableCell>
                                        <TableCell sx={{ fontSize: '0.85rem' }}>{e.method} {e.endpoint}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>{e.user_name || 'Guest'}</TableCell>
                                        <TableCell align="right">
                                            <Button size="small" variant="outlined" onClick={() => onSelect(e)} sx={{ borderRadius: 2, fontSize: '0.65rem' }}>View Details</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Fade>
    );
}

import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function SystemTab({ metrics }: any) {
    if (!metrics) return null;

    const uptimeHrs = Math.floor(metrics.uptime / 3600);
    const uptimeMins = Math.floor((metrics.uptime % 3600) / 60);

    return (
        <Fade in timeout={500}>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 4 }}>System Monitoring</Typography>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 4, bgcolor: '#FAFAFA' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Resources</Typography>
                            <Stack spacing={4}>
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Memory Usage (Heap)</Typography>
                                        <Typography variant="body2" color="primary">{metrics.memory.heapUsed}MB / {metrics.memory.heapTotal}MB</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(metrics.memory.heapUsed / metrics.memory.heapTotal) * 100}
                                        sx={{ height: 10, borderRadius: 5 }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Database Size</Typography>
                                    <Chip label={`${metrics.database.sizeMB} MB`} color="primary" />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Server Uptime</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{uptimeHrs}h {uptimeMins}m</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#F1F8E9', gap: 2 }}>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                <CircularProgress variant="determinate" value={100} size={100} thickness={5} sx={{ color: 'success.light' }} />
                                <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 50 }} />
                                </Box>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.dark' }}>System Online</Typography>
                            <Typography variant="body2" color="text.secondary" textAlign="center">Backend is running optimally on Bun Runtime</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Fade>
    );
}
