import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Grid, Paper, Stack,
    Button, CircularProgress, Fade, Avatar, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
    History,
    LocalFireDepartment,
    MonitorHeart,
    ArrowForward,
    KeyboardArrowRight,
    Logout,
    WarningAmber,
    Place
} from '@mui/icons-material';
import { authApi } from '../../api';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { syncService } from '../../services/syncService';

export default function OperatorDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [logoutOpen, setLogoutOpen] = useState(false);

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

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    useEffect(() => {
        const init = async () => {
            if (await syncService.isOnline()) {
                syncService.pullFromServer();
                syncService.syncPendingChanges();
            }
            try {
                const userRes = await authApi.getMe();
                setUser(userRes.data);
                if (userRes.data.id) localStorage.setItem('user_id', String(userRes.data.id));
            } catch (e) {
                const savedName = localStorage.getItem('user_name') || 'นวัตกร';
                setUser({ name: savedName });
            }
            setLoading(false);
        };
        init();
    }, []);

    const userName = user?.name || localStorage.getItem('user_name') || 'นวัตกร';

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
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
            {/* Mobile Header */}
            <Box sx={{
                bgcolor: 'white',
                borderBottom: '1px solid #EFEBE9',
                py: 2.5,
                px: 2,
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxShadow: '0 4px 6px -2px rgba(62, 39, 35, 0.05)'
            }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        onClick={() => navigate('/profile')}
                        sx={{
                            cursor: 'pointer',
                            p: 0.5,
                            pr: 2,
                            borderRadius: '20px',
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                            '&:active': { transform: 'scale(0.98)' }
                        }}
                    >
                        <Avatar sx={{
                            bgcolor: 'secondary.main',
                            width: 50,
                            height: 50,
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)'
                        }}>
                            {userName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2, color: 'primary.main' }}>{userName}</Typography>
                            <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>นวัตกร</Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <IconButton size="large" onClick={() => setLogoutOpen(true)} sx={{ color: 'error.main', bgcolor: '#FFF5F5', borderRadius: 3 }}>
                            <Logout />
                        </IconButton>
                    </Stack>
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
                            borderRadius: 7,
                            background: 'linear-gradient(135deg, #3E2723 0%, #1B0000 100%)', // Charcoal Brown
                            color: 'white',
                            boxShadow: '0 20px 40px -10px rgba(62, 39, 35, 0.4)',
                            position: 'relative',
                            overflow: 'hidden',
                            mb: 4,
                            cursor: 'pointer'
                        }} onClick={() => navigate('/operator/start-burn')}>
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="h2" sx={{ fontWeight: 950, mb: 1, letterSpacing: -1, color: '#fff' }}>เริ่มการเผา 🔥</Typography>
                                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.92)', mb: 4, fontWeight: 600 }}>
                                    กดที่นี่เพื่อเริ่มต้นบันทึกการเผาถ่านรอบใหม่
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForward sx={{ fontSize: 30 }} />}
                                    sx={{
                                        bgcolor: 'secondary.main',
                                        '&:hover': { bgcolor: 'secondary.dark' },
                                        borderRadius: 4,
                                        px: 4,
                                        py: 2,
                                        fontSize: '1.25rem',
                                        fontWeight: 900,
                                        textTransform: 'none',
                                        boxShadow: '0 8px 20px rgba(46, 125, 50, 0.4)'
                                    }}
                                >
                                    เริ่มบันทึกข้อมูล
                                </Button>
                            </Box>
                            <LocalFireDepartment sx={{
                                position: 'absolute',
                                bottom: -40,
                                right: -30,
                                fontSize: 240,
                                opacity: 0.1,
                                transform: 'rotate(-10deg)',
                                color: 'secondary.light'
                            }} />
                        </Paper>

                        {/* Assigned Kilns */}
                        {myKilns.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 950, mb: 2, px: 0.5 }}>เตาที่คุณรับผิดชอบ</Typography>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 2,
                                    overflowX: 'auto',
                                    pb: 2,
                                    px: 0.5,
                                    '&::-webkit-scrollbar': { display: 'none' }
                                }}>
                                    {myKilns.map((k) => (
                                        <Paper key={k.kiln_id} sx={{
                                            minWidth: 190,
                                            maxWidth: 190,
                                            height: 240,
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            background: k.image ? `url(${k.image}) center/cover no-repeat` : 'linear-gradient(135deg, #3E2723 0%, #1B0000 100%)',
                                            flexShrink: 0,
                                            boxShadow: '0 12px 24px -10px rgba(0,0,0,0.3)',
                                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            '&:hover': {
                                                transform: 'translateY(-10px) scale(1.02)',
                                                boxShadow: '0 20px 30px -10px rgba(0,0,0,0.4)',
                                                '& .kiln-overlay': { bgcolor: 'rgba(0,0,0,0.4)' },
                                                '& .kiln-info': { transform: 'translateY(0)' }
                                            }
                                        }}>
                                            {/* Gradient & Glass Overlay */}
                                            <Box className="kiln-overlay" sx={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'flex-end',
                                                p: 2.5
                                            }}>
                                                <Box className="kiln-info" sx={{
                                                    transform: 'translateY(10px)',
                                                    transition: 'all 0.4s ease'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{
                                                        fontWeight: 900,
                                                        color: 'white',
                                                        mb: 0.5,
                                                        lineHeight: 1.2,
                                                        fontSize: '1.1rem',
                                                        letterSpacing: -0.5,
                                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                                    }}>
                                                        {k.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{
                                                        color: 'rgba(255,255,255,0.8)',
                                                        fontWeight: 700,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.5,
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        <Place sx={{ fontSize: 14, color: 'secondary.light' }} />
                                                        {k.location || 'ไม่ระบุพิกัด'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Status Badge */}
                                            <Box sx={{
                                                position: 'absolute', top: 12, right: 12,
                                                backdropFilter: 'blur(8px)',
                                                bgcolor: 'rgba(255, 255, 255, 0.15)',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                borderRadius: '12px',
                                                px: 1.2, py: 0.4,
                                                display: 'flex', alignItems: 'center', gap: 0.5
                                            }}>
                                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'secondary.main', boxShadow: '0 0 8px #85A98F' }} />
                                                <Typography sx={{ color: 'white', fontSize: '0.65rem', fontWeight: 900, letterSpacing: 0.5 }}>ACTIVE</Typography>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                            </Box>
                        )}

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
            {/* Logout Confirmation Dialog */}
            <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)} PaperProps={{ sx: { borderRadius: 5, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 900, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <WarningAmber sx={{ color: 'error.main' }} />
                    ออกจากระบบ
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        คุณต้องการออกจากระบบใช่หรือไม่?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setLogoutOpen(false)} variant="outlined" sx={{ borderRadius: 3, fontWeight: 800, textTransform: 'none' }}>ยกเลิก</Button>
                    <Button onClick={handleLogout} variant="contained" color="error" sx={{ borderRadius: 3, fontWeight: 800, textTransform: 'none' }}>ออกจากระบบ</Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}