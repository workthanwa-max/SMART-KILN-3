import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Grid, Paper, Stack,
    Button, CircularProgress, Fade, Avatar, IconButton, Chip
} from '@mui/material';
import {
    History,
    LocalFireDepartment,
    MonitorHeart,
    ArrowForward,
    Logout,
    KeyboardArrowRight
} from '@mui/icons-material';
import { authApi } from '../../api';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { syncService } from '../../services/syncService';

export default function OperatorDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const userId = Number(localStorage.getItem('user_id'));

    // 1. Live Query: Assignments (Must be first as others depend on it)
    const myAssignments = useLiveQuery(() =>
        userId ? db.user_kilns.where('user_id').equals(userId).toArray() : []
        , [userId]) || [];

    // 2. Live Query: Kilns based on Assignments
    const myKilns = useLiveQuery(async () => {
        if (!myAssignments.length) return [];
        const kilnIds = myAssignments.map(uk => uk.kiln_id);
        return db.kilns.where('kiln_id').anyOf(kilnIds).and(k => k.is_active === 1).toArray();
    }, [myAssignments]) || [];

    // 3. Live Query: Recent Activities
    const recentActivities = useLiveQuery(async () => {
        if (!userId) return [];
        const myExps = await db.experiments.where('operator_id').equals(userId).reverse().limit(5).toArray();
        if (!myExps.length) return [];

        const kilnIds = myExps.map(e => e.kiln_id);
        const kilnsList = await db.kilns.where('kiln_id').anyOf(kilnIds).toArray();
        const kilnMap = new Map(kilnsList.map(k => [k.kiln_id, k.name]));

        return myExps.map(e => ({
            ...e,
            kiln_name: kilnMap.get(e.kiln_id) || 'Unknown Kiln',
            created_at: e.created_at || new Date().toISOString()
        }));
    }, [userId]);

    const assignedKilnsCount = myKilns.length;

    // 4. Live Query: Summary Stats
    const mySummary = useLiveQuery(async () => {
        if (!userId) return { runs: 0, hours: 0, weight: 0 };
        const exps = await db.experiments.where('operator_id').equals(userId).toArray();
        const runs = exps.length;
        const hours = exps.reduce((sum, e) => sum + e.burn_hours, 0);
        const weight = exps.reduce((sum, e) => sum + (e.charcoal_weight || 0), 0);
        return { runs, hours, weight };
    }, [userId]);

    useEffect(() => {
        const init = async () => {
            if (await syncService.isOnline()) {
                syncService.pullFromServer();
                syncService.syncPendingChanges();
            }
            try {
                const userRes = await authApi.getMe();
                setUser(userRes.data);
                // Ensure ID is saved if missing (e.g. slight race condition)
                if (userRes.data.id) localStorage.setItem('user_id', String(userRes.data.id));
            } catch (e) {
                const savedName = localStorage.getItem('user_name') || 'พนักงาน';
                setUser({ name: savedName });
            }
            setLoading(false);
        };
        init();
    }, []);

    const handleLogout = () => {
        if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
            localStorage.clear();
            navigate('/login');
        }
    };

    const userName = user?.name || localStorage.getItem('user_name') || 'พนักงาน';

    const kpiData = [
        {
            label: 'เตาที่ดูแล',
            value: assignedKilnsCount,
            icon: <LocalFireDepartment />,
            color: '#3b82f6',
            bg: '#eff6ff'
        },
        {
            label: 'บันทึกทั้งหมด',
            value: mySummary?.runs || 0,
            icon: <History />,
            color: '#10b981',
            bg: '#ecfdf5'
        },
    ];

    if (loading) return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 4 }}>
            {/* Mobile Header */}
            <Box sx={{
                bgcolor: 'white',
                borderBottom: '1px solid #e2e8f0',
                py: 2,
                px: 2,
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{
                            bgcolor: 'primary.main',
                            width: 42,
                            height: 42,
                            fontSize: '1rem',
                            fontWeight: 800,
                            borderRadius: '12px',
                            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
                        }}>
                            {userName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: '1rem', lineHeight: 1.2 }}>{userName}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>พนักงานปฏิบัติงาน</Typography>
                        </Box>
                    </Stack>
                    <IconButton size="small" onClick={handleLogout} sx={{ color: 'error.main', bgcolor: '#fef2f2' }}>
                        <Logout fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>

            <Container maxWidth="sm" sx={{ mt: 3 }}>
                <Fade in timeout={800}>
                    <Box>
                        {/* KPI Cards */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {kpiData.map((kpi, idx) => (
                                <Grid size={{ xs: 6 }} key={idx}>
                                    <Paper sx={{
                                        p: 2,
                                        borderRadius: 4,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        gap: 1,
                                        border: '1px solid #e2e8f0',
                                        bgcolor: 'white'
                                    }}>
                                        <Avatar sx={{
                                            bgcolor: kpi.bg,
                                            color: kpi.color,
                                            width: 44, height: 44,
                                            borderRadius: '12px',
                                        }}>{kpi.icon}</Avatar>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                                                {kpi.label}
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>
                                                {kpi.value}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Hero Button */}
                        <Paper sx={{
                            p: 4,
                            borderRadius: 6,
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                            color: 'white',
                            boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            mb: 3,
                            cursor: 'pointer'
                        }} onClick={() => navigate('/operator/start-burn')}>
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>เริ่มการเผา 🔥</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                                    กดที่นี่เพื่อเริ่มต้นบันทึกการเผาถ่านรอบใหม่
                                </Typography>
                                <Button
                                    variant="contained"
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        borderRadius: 3,
                                        px: 3,
                                        fontWeight: 800,
                                        textTransform: 'none'
                                    }}
                                >
                                    เริ่มบันทึก
                                </Button>
                            </Box>
                            <LocalFireDepartment sx={{
                                position: 'absolute',
                                bottom: -30,
                                right: -20,
                                fontSize: 180,
                                opacity: 0.05,
                                transform: 'rotate(-10deg)'
                            }} />
                        </Paper>

                        {/* Recent Activity */}
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>กิจกรรมล่าสุด</Typography>
                            <Button size="small" onClick={() => navigate('/operator/history')} sx={{ fontWeight: 700 }}>ดูทั้งหมด</Button>
                        </Box>

                        <Stack spacing={2}>
                            {recentActivities?.map((act: any, idx: number) => (
                                <Paper key={idx} sx={{
                                    p: 2,
                                    borderRadius: 4,
                                    border: '1px solid #e2e8f0',
                                    bgcolor: 'white',
                                    cursor: 'pointer'
                                }} onClick={() => navigate(`/operator/experiment/${act.experiment_id}`)}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: '#eff6ff', color: 'primary.main', borderRadius: 2 }}>
                                            <LocalFireDepartment fontSize="small" />
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{act.kiln_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(act.created_at).toLocaleDateString('th-TH')}
                                            </Typography>
                                            {(act.temperature > 0 || act.wood_vinegar_quantity > 0) && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mt: 0.5 }}>
                                                    {act.temperature ? `🌡️ ${act.temperature}°C` : ''}
                                                    {act.temperature && act.wood_vinegar_quantity ? ' • ' : ''}
                                                    {act.wood_vinegar_quantity ? `💧 ${act.wood_vinegar_quantity} ลิตร` : ''}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Stack alignItems="flex-end">
                                            <Chip
                                                label={act.quality_grade ? `เกรด ${act.quality_grade}` : 'กำลังเผา'}
                                                size="small"
                                                color={act.quality_grade ? 'success' : 'info'}
                                                sx={{ fontWeight: 800, borderRadius: 1.5, fontSize: '0.7rem' }}
                                            />
                                            <KeyboardArrowRight fontSize="small" sx={{ color: 'text.disabled', mt: 0.5 }} />
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                            {(!recentActivities || recentActivities.length === 0) && (
                                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: '1px dashed #e2e8f0' }}>
                                    <Typography variant="body2" color="text.secondary">คุณยังไม่มีกิจกรรมในระบบ</Typography>
                                </Paper>
                            )}
                        </Stack>

                        {/* Profile Info */}
                        <Paper sx={{ mt: 4, p: 2, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <MonitorHeart sx={{ color: 'primary.main', opacity: 0.8 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>เบอร์ของคุณ</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{user?.phone || '-'}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box >
    );
}