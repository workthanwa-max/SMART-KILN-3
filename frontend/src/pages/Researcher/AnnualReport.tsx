import { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Grid, Paper, Stack,
    MenuItem, TextField, CircularProgress, Fade, Avatar,
    Divider, IconButton, Tooltip, Chip
} from '@mui/material';
import {
    CalendarMonth,
    Co2,
    Opacity,
    LocalFireDepartment,
    Forest,
    HistoryEdu,
    Download
} from '@mui/icons-material';
import { dashboardApi } from '../../api';
import Sidebar from '../../components/Sidebar';

const drawerWidth = 280;

export default function AnnualReport() {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    useEffect(() => {
        loadReport();
    }, [selectedYear]);

    const loadReport = async () => {
        setLoading(true);
        try {
            const res = await dashboardApi.getAnnualReport(selectedYear);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress thickness={5} />
            </Box>
        );
    }

    const {
        summary = { total_weight: 0, experiments: 0, carbon_credits: 0, total_hours: 0 },
        monthly_chart = [],
        wood_usage = []
    } = data || {};

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Sidebar />

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Container maxWidth="xl">
                    <Fade in timeout={800}>
                        <Box>
                            {/* Header Section */}
                            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                                <Box>
                                    <Typography variant="h3" sx={{ fontWeight: 950, color: '#0f172a', letterSpacing: -1.5 }}>
                                        📊 สรุปรายงานประจำปี
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                                        ภาพรวมการผลิตถ่านวิจัยและสถิติสะสมรายเดือน
                                    </Typography>
                                </Box>

                                <Paper sx={{ p: 1, borderRadius: 4, display: 'flex', alignItems: 'center', bgcolor: '#fff', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                    <TextField
                                        select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        size="small"
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: <CalendarMonth sx={{ mr: 1, color: 'primary.main' }} />,
                                            sx: { borderRadius: 3, fontWeight: 800, minWidth: 140, '& fieldset': { border: 'none' } }
                                        }}
                                    >
                                        {years.map(y => (
                                            <MenuItem key={y} value={y} sx={{ fontWeight: 700 }}>ปี พ.ศ. {y + 543}</MenuItem>
                                        ))}
                                    </TextField>
                                </Paper>
                            </Box>

                            {/* KPI Grid */}
                            <Grid container spacing={3} sx={{ mb: 6 }}>
                                {[
                                    { label: 'น้ำหนักถ่านรวม', value: summary?.total_weight?.toLocaleString() || '0', unit: 'กก.', icon: <LocalFireDepartment />, color: '#f59e0b', sub: 'รวมทุกเกรดคุณภาพ' },
                                    { label: 'จำนวนการเผา', value: summary?.experiments || '0', unit: 'ครั้ง', icon: <HistoryEdu />, color: '#3b82f6', sub: 'รายการที่เสร็จสมบูรณ์' },
                                    { label: 'ประมาณการคาร์บอนเครดิต', value: summary?.carbon_credits?.toFixed(3) || '0.000', unit: 'tCO2e', icon: <Co2 />, color: '#10b981', sub: 'ค่ากักเก็บก๊าซเรือนกระจก' },
                                    { label: 'ชั่วโมงการทำงานสะสม', value: summary?.total_hours?.toLocaleString() || '0', unit: 'ชม.', icon: <Opacity />, color: '#6366f1', sub: 'ระยะเวลาใช้งานเตาทั้งหมด' },
                                ].map((kpi, idx) => (
                                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={idx}>
                                        <Paper sx={{
                                            p: 3, borderRadius: 6, border: '1px solid #e2e8f0',
                                            display: 'flex', flexDirection: 'column', gap: 2,
                                            height: '100%', position: 'relative', overflow: 'hidden',
                                            '&:hover': { transform: 'translateY(-4px)', transition: '0.3s' }
                                        }}>
                                            <Avatar sx={{ bgcolor: `${kpi.color}15`, color: kpi.color, width: 56, height: 56, borderRadius: 4 }}>
                                                {kpi.icon}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    {kpi.label}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="baseline">
                                                    <Typography variant="h3" sx={{ fontWeight: 950, color: '#1e293b' }}>
                                                        {kpi.value}
                                                    </Typography>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#94a3b8' }}>
                                                        {kpi.unit}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                                    {kpi.sub}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Charts Section */}
                            <Grid container spacing={4}>
                                {/* Monthly Production Chart (Custom implementation) */}
                                <Grid size={{ xs: 12, lg: 8 }}>
                                    <Paper sx={{ p: 4, borderRadius: 8, border: '1px solid #e2e8f0', height: '100%' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
                                            <Box>
                                                <Typography variant="h5" sx={{ fontWeight: 900 }}>📈 สถิติผลผลิตรายเดือน</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>เปรียบเทียบน้ำหนักถ่านและการกักเก็บคาร์บอน</Typography>
                                            </Box>
                                            <Tooltip title="ดาวน์โหลดรายงาน">
                                                <IconButton sx={{ bgcolor: '#f8fafc' }}><Download /></IconButton>
                                            </Tooltip>
                                        </Stack>

                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            justifyContent: 'space-between',
                                            height: 300,
                                            gap: 1.5,
                                            mt: 4,
                                            px: 1
                                        }}>
                                            {(() => {
                                                const maxWeight = monthly_chart?.length > 0
                                                    ? Math.max(...monthly_chart.map((d: any) => d.weight)) || 1
                                                    : 1;
                                                return monthly_chart?.map((m: any, i: number) => {
                                                    const height = (m.weight / maxWeight) * 100;
                                                    const hasActivity = m.experiments > 0;

                                                    return (
                                                        <Box key={i} sx={{
                                                            flex: 1,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            height: '100%',
                                                            justifyContent: 'flex-end'
                                                        }}>
                                                            <Tooltip
                                                                title={
                                                                    <Box sx={{ p: 0.5 }}>
                                                                        <Typography variant="caption" display="block" sx={{ fontWeight: 800 }}>{m.label}</Typography>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>🔥 จำนวนการเผา: {m.experiments} ครั้ง</Typography>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>⚖️ น้ำหนักถ่าน: {m.weight?.toLocaleString() || '0'} กก.</Typography>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>🌿 คาร์บอน: {m.carbon?.toFixed(3) || '0.000'} tCO2e</Typography>
                                                                    </Box>
                                                                }
                                                                arrow
                                                            >
                                                                <Box sx={{
                                                                    width: '100%',
                                                                    height: `${Math.max(height, hasActivity ? 5 : 0)}%`,
                                                                    bgcolor: m.weight > 0 ? 'primary.main' : hasActivity ? '#94a3b8' : '#f1f5f9',
                                                                    borderRadius: '8px 8px 4px 4px',
                                                                    transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    position: 'relative',
                                                                    cursor: 'pointer',
                                                                    '&:hover': { bgcolor: m.weight > 0 ? 'primary.dark' : '#64748b' }
                                                                }} />
                                                            </Tooltip>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.65rem' }}>
                                                                {m.label}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                });
                                            })()}
                                        </Box>

                                        <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

                                        <Stack direction="row" spacing={4}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>ปริมาณถ่าน (กก.)</Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f1f5f9' }} />
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>ไม่มีการผลิต</Typography>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Wood Type Usage */}
                                <Grid size={{ xs: 12, lg: 4 }}>
                                    <Paper sx={{ p: 4, borderRadius: 8, border: '1px solid #e2e8f0', height: '100%' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>🪵 วัตถุดิบเด่นในปีนี้</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 600 }}>สัดส่วนการใช้ชนิดไม้ในการผลิต</Typography>

                                        <Stack spacing={4} sx={{ mt: 4 }}>
                                            {wood_usage?.length === 0 ? (
                                                <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
                                                    <Forest sx={{ fontSize: 48, mb: 2 }} />
                                                    <Typography variant="body2">ไม่มีข้อมูลการใช้วัตถุดิบ</Typography>
                                                </Box>
                                            ) : wood_usage?.map((w: any, i: number) => {
                                                const totalWood = wood_usage.reduce((acc: any, curr: any) => acc + curr.total_quantity, 0);
                                                const percentage = totalWood > 0 ? (w.total_quantity / totalWood) * 100 : 0;
                                                return (
                                                    <Box key={i}>
                                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                                            <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>{w.wood_type}</Typography>
                                                            <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>{percentage.toFixed(0)}%</Typography>
                                                        </Stack>
                                                        <Box sx={{ height: 12, bgcolor: '#f8fafc', borderRadius: 4, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                                            <Box sx={{
                                                                width: `${percentage}%`,
                                                                height: '100%',
                                                                bgcolor: i === 0 ? '#10b981' : i === 1 ? '#3b82f6' : '#6366f1',
                                                                borderRadius: 4
                                                            }} />
                                                        </Box>
                                                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', fontWeight: 600, color: '#94a3b8' }}>
                                                            ปริมาณรวม {w.total_quantity.toLocaleString()} กิโลกรัม
                                                        </Typography>
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Carbon Credit Detail Card */}
                                <Grid size={{ xs: 12 }}>
                                    <Paper sx={{
                                        p: 4, borderRadius: 8, bgcolor: '#10b981', color: '#fff',
                                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                        boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.4)',
                                        border: 'none',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <Co2 sx={{ position: 'absolute', right: -20, bottom: -20, fontSize: 200, opacity: 0.15 }} />
                                        <Grid container spacing={4} alignItems="center">
                                            <Grid size={{ xs: 12, md: 7 }}>
                                                <Stack spacing={2}>
                                                    <Chip
                                                        label="Sustainable Impact"
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 900, width: 'fit-content', border: 'none' }}
                                                    />
                                                    <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: -1 }}>
                                                        โครงการลดก๊าซเรือนกระจก
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9, lineHeight: 1.6 }}>
                                                        จากการผลิตถ่านในปี {selectedYear + 543} ท่านได้ช่วยกักเก็บก๊าซคาร์บอนไดออกไซด์ (CO2) เทียบเท่ากับ
                                                        <Box component="span" sx={{ fontWeight: 950, mx: 1, fontSize: '1.5em', textDecoration: 'underline' }}>
                                                            {summary?.carbon_credits.toFixed(3)} ตัน
                                                        </Box>
                                                        ซึ่งเป็นการทำเกษตรกรรมที่ช่วยลดภาวะโลกร้อนอย่างยั่งยืน
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 5 }}>
                                                <Paper sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                                                        Carbon Calculation Detail
                                                    </Typography>
                                                    <Stack spacing={2}>
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography sx={{ fontWeight: 600 }}>น้ำหนักถ่าน</Typography>
                                                            <Typography sx={{ fontWeight: 900 }}>{summary?.total_weight.toLocaleString()} kg</Typography>
                                                        </Stack>
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography sx={{ fontWeight: 600 }}>สัมประสิทธิ์กักเก็บ (Factor)</Typography>
                                                            <Typography sx={{ fontWeight: 900 }}>x 2.5 CO2e</Typography>
                                                        </Stack>
                                                        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>ค่ารวมสุทธิ</Typography>
                                                            <Typography variant="h5" sx={{ fontWeight: 950 }}>{summary?.carbon_credits.toFixed(3)} tCO2e</Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    </Fade>
                </Container>
            </Box>
        </Box>
    );
}
