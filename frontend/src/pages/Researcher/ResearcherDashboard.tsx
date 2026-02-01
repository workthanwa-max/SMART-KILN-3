import { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Grid, Paper, Stack,
    CircularProgress, Fade, Avatar, Button, useTheme,
    Chip, LinearProgress
} from '@mui/material';
import {
    LocalFireDepartment,
    Science,
    Group,
    CalendarMonth,
    MonitorHeart,
    QueryStats,
    CheckCircle,
    AccessTime,
    ChevronRight,
    Assessment
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api';
import Sidebar from '../../components/Sidebar';

const drawerWidth = 280;

export default function ResearcherDashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardApi.getStats()
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress thickness={5} size={60} />
        </Box>
    );

    const overview = stats?.overview || {};
    const grades = stats?.grade_distribution || [];
    const recent = stats?.recent_experiments || [];

    const kpiData = [
        { label: 'เตาที่ใช้งานได้', value: overview.active_kilns || 0, icon: <LocalFireDepartment />, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'กำลังเผาอยู่ (Live)', value: overview.in_use_kilns || 0, icon: <QueryStats />, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'พนักงานทั้งหมด', value: overview.operator_count || 0, icon: <Group />, color: '#10b981', bg: '#ecfdf5' },
        { label: 'การเผาทั้งหมด', value: overview.total_experiments || 0, icon: <Science />, color: '#8b5cf6', bg: '#f5f3ff' },
    ];

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Sidebar />

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Container maxWidth="xl">
                    <Fade in timeout={800}>
                        <Box>
                            {/* Header Section */}
                            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: -1, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Science sx={{ fontSize: 45, color: 'primary.main' }} />
                                        Researcher Dashboard
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8, ml: 1 }}>
                                        ภาพรวมระบบวิจัยและติดตามการปฏิบัติงานรายวัน
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CalendarMonth />}
                                        sx={{ borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white', color: 'text.primary', fontWeight: 700 }}
                                    >
                                        {new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/master-list')}
                                        sx={{ borderRadius: 3, px: 3, fontWeight: 700 }}
                                    >
                                        ดูรายการทั้งหมด
                                    </Button>
                                </Stack>
                            </Box>

                            {/* KPI Visualization */}
                            <Grid container spacing={3} sx={{ mb: 6 }}>
                                {kpiData.map((kpi, idx) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                                        <Paper sx={{
                                            p: 3,
                                            borderRadius: 6,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2.5,
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                            transition: '0.3s',
                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 20px -10px rgba(0,0,0,0.08)' }
                                        }}>
                                            <Avatar sx={{
                                                bgcolor: kpi.bg,
                                                color: kpi.color,
                                                width: 64, height: 64,
                                                borderRadius: '20px',
                                                fontSize: '2rem'
                                            }}>{kpi.icon}</Avatar>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                                                    {kpi.label}
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b' }}>
                                                    {kpi.value}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            <Grid container spacing={4}>
                                {/* Left Section: Recent Activity & Live Tracking */}
                                <Grid size={{ xs: 12, lg: 8 }}>
                                    <Stack spacing={4}>
                                        {/* Recent Experiments */}
                                        <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <AccessTime color="primary" /> รายการล่าสุด
                                                </Typography>
                                                <Button endIcon={<ChevronRight />} onClick={() => navigate('/master-list')}>ทั้งหมด</Button>
                                            </Box>
                                            <Stack spacing={2}>
                                                {recent.length === 0 ? (
                                                    <Box sx={{ textAlign: 'center', py: 5, bgcolor: '#f8fafc', borderRadius: 4 }}>
                                                        <Typography color="text.secondary">ไม่มีข้อมูลการเผาล่าสุด</Typography>
                                                    </Box>
                                                ) : recent.map((exp: any) => (
                                                    <Box
                                                        key={exp.experiment_id}
                                                        onClick={() => navigate(`/researcher/experiment/${exp.experiment_id}`)}
                                                        sx={{
                                                            p: 2.5,
                                                            bgcolor: '#f8fafc',
                                                            borderRadius: 4,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            transition: '0.2s',
                                                            '&:hover': { bgcolor: '#f1f5f9', cursor: 'pointer' },
                                                        }}
                                                    >

                                                        <Stack direction="row" spacing={3} alignItems="center">
                                                            <Avatar sx={{ bgcolor: exp.quality_grade ? 'success.light' : 'warning.light', color: exp.quality_grade ? 'success.main' : 'warning.main', borderRadius: 3 }}>
                                                                {exp.quality_grade ? <CheckCircle /> : <LocalFireDepartment />}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body1" sx={{ fontWeight: 800 }}>{exp.kiln_name}</Typography>
                                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>โดย {exp.operator_name}</Typography>
                                                            </Box>
                                                        </Stack>
                                                        <Stack direction="row" spacing={4} alignItems="center">
                                                            {exp.quality_grade ? (
                                                                <Box sx={{ textAlign: 'right' }}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>{exp.charcoal_weight} กก.</Typography>
                                                                    <Chip label={exp.quality_grade} size="small" color="success" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 800 }} />
                                                                </Box>
                                                            ) : (
                                                                <Chip label="กำลังดำเนินการ" color="warning" variant="outlined" sx={{ fontWeight: 700 }} />
                                                            )}
                                                            <Box sx={{ textAlign: 'right' }}>
                                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block' }}>
                                                                    {new Date(exp.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                                                </Typography>
                                                                {(exp.temperature > 0 || exp.wood_vinegar_quantity > 0) && (
                                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mt: 0.5 }}>
                                                                        {exp.temperature ? `🌡️ ${exp.temperature}°C` : ''}
                                                                        {exp.temperature && exp.wood_vinegar_quantity ? ' • ' : ''}
                                                                        {exp.wood_vinegar_quantity ? `💧 ${exp.wood_vinegar_quantity} L` : ''}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Paper>

                                        {/* Monthly Goals or Yield Summary */}
                                        <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>สรุปผลผลิตรวม</Typography>
                                            <Grid container spacing={4}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <Box sx={{ p: 3, border: '1px solid #f1f5f9', borderRadius: 5, textAlign: 'center' }}>
                                                        <MonitorHeart sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
                                                        <Typography variant="h4" sx={{ fontWeight: 900 }}>{overview.total_charcoal_weight} กก.</Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ถ่านที่ผลิตได้ทั้งหมด</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <Box sx={{ p: 3, bgcolor: '#f0f9ff', borderRadius: 5 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 800, mb: 1.5 }}>เป้าหมายการทดลองรายเดือน</Typography>
                                                        <LinearProgress variant="determinate" value={Math.min((overview.total_experiments / 20) * 100, 100)} sx={{ height: 10, borderRadius: 5, mb: 1 }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{overview.total_experiments} / 20 ครั้ง</Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Stack>
                                </Grid>

                                {/* Right Section: Grade Distribution & Quick Actions */}
                                <Grid size={{ xs: 12, lg: 4 }}>
                                    <Stack spacing={4}>
                                        {/* Quality Distribution */}
                                        <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Assessment color="secondary" /> คุณภาพถ่าน (Analysis)
                                            </Typography>
                                            <Stack spacing={3}>
                                                {['ดี', 'พอใช้', 'แย่'].map(g => {
                                                    const stat = grades.find((s: any) => s.grade === g);
                                                    const count = stat ? stat.count : 0;
                                                    const percentage = overview.total_experiments > 0 ? (count / overview.total_experiments) * 100 : 0;
                                                    return (
                                                        <Box key={g}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>คุณภาพ {g}</Typography>
                                                                <Typography variant="body2" color="text.secondary">{count} ครั้ง ({Math.round(percentage)}%)</Typography>
                                                            </Box>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={percentage}
                                                                color={g === 'ดี' ? 'success' : g === 'พอใช้' ? 'warning' : 'error'}
                                                                sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9' }}
                                                            />
                                                        </Box>
                                                    );
                                                })}
                                            </Stack>
                                        </Paper>

                                        {/* Design & Quick Actions Card */}
                                        <Paper sx={{
                                            p: 4,
                                            borderRadius: 6,
                                            bgcolor: theme.palette.primary.main,
                                            color: 'white',
                                            boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.25)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, position: 'relative', zIndex: 1 }}>การจัดการข้อมูล</Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 4, position: 'relative', zIndex: 1 }}>
                                                เริ่มต้นมอบหมายเตาและจัดการบุคลากรเพื่อขับเคลื่อนงานวิจัยของคุณ
                                            </Typography>

                                            <Stack spacing={1.5}>
                                                <Button
                                                    variant="contained" fullWidth
                                                    onClick={() => navigate('/assign-kilns')}
                                                    sx={{ bgcolor: 'white', color: 'primary.main', borderRadius: 3, py: 1.2, fontWeight: 800, '&:hover': { bgcolor: '#f8fafc' } }}
                                                >
                                                    มอบหมายงานใหม่
                                                </Button>
                                                <Button
                                                    variant="contained" fullWidth
                                                    onClick={() => navigate('/manage-users')}
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 3, py: 1.2, fontWeight: 700, '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
                                                >
                                                    จัดการสมาชิก
                                                </Button>
                                            </Stack>

                                            <MonitorHeart sx={{
                                                position: 'absolute',
                                                bottom: -30,
                                                right: -30,
                                                fontSize: 180,
                                                opacity: 0.1,
                                                transform: 'rotate(-15deg)'
                                            }} />
                                        </Paper>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                    </Fade>
                </Container>
            </Box>
        </Box>
    );
}