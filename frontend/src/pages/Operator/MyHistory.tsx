import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Paper, Stack,
    Chip, MenuItem, Select, FormControl, InputLabel,
    CircularProgress, CardActionArea, Divider, Fade, Avatar, IconButton
} from '@mui/material';
import {
    Timer,
    Scale,
    LocalFireDepartment,
    ArrowBack,
    KeyboardArrowRight,
    TrendingUp
} from '@mui/icons-material';
import { dashboardApi } from '../../api';

export default function MyHistory() {
    const navigate = useNavigate();
    const [history, setHistory] = useState<any[]>([]);
    const [kilns, setKilns] = useState<any[]>([]);
    const [filterKiln, setFilterKiln] = useState('');
    const [filterGrade, setFilterGrade] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await dashboardApi.getStats();
                setHistory(res.data.recent_activities || []);
                setKilns(res.data.assigned_kilns || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredHistory = history.filter(item => {
        const matchesKiln = filterKiln === '' || item.kiln_name === filterKiln;
        const matchesGrade = filterGrade === 'all' ||
            (filterGrade === 'Pending' ? !item.quality_grade : item.quality_grade === filterGrade);
        return matchesKiln && matchesGrade;
    });

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'ดี': return 'success';
            case 'พอใช้': return 'warning';
            case 'แย่': return 'error';
            default: return 'default';
        }
    };

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
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                <IconButton onClick={() => navigate('/operator/dashboard')} size="small">
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>ประวัติการเผา</Typography>
            </Box>

            <Container maxWidth="md" sx={{ mt: 2 }}>
                <Fade in timeout={800}>
                    <Box>
                        {/* Filter */}
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <FormControl size="small" fullWidth>
                                <InputLabel id="filter-kiln-label">เตาเผา</InputLabel>
                                <Select
                                    labelId="filter-kiln-label"
                                    value={filterKiln}
                                    label="เตาเผา"
                                    onChange={(e) => setFilterKiln(e.target.value)}
                                    sx={{ borderRadius: 3, bgcolor: 'white' }}
                                >
                                    <MenuItem value="">ทุกเตา</MenuItem>
                                    {kilns.map(k => (
                                        <MenuItem key={k.kiln_id || k.id} value={k.name}>{k.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" fullWidth>
                                <InputLabel id="filter-grade-label">คุณภาพ</InputLabel>
                                <Select
                                    labelId="filter-grade-label"
                                    value={filterGrade}
                                    label="คุณภาพ"
                                    onChange={(e) => setFilterGrade(e.target.value)}
                                    sx={{ borderRadius: 3, bgcolor: 'white' }}
                                >
                                    <MenuItem value="all">ทุกคุณภาพ</MenuItem>
                                    <MenuItem value="ดี">คุณภาพ ดี</MenuItem>
                                    <MenuItem value="พอใช้">คุณภาพ พอใช้</MenuItem>
                                    <MenuItem value="แย่">คุณภาพ แย่</MenuItem>
                                    <MenuItem value="Pending">กำลังเผา</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>

                        {/* List Items */}
                        <Stack spacing={2}>
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((item) => (
                                    <Paper
                                        key={item.experiment_id || item.id}
                                        elevation={0}
                                        sx={{
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            border: '1px solid #e2e8f0',
                                            bgcolor: 'white'
                                        }}
                                    >
                                        <CardActionArea
                                            onClick={() => navigate(`/operator/experiment/${item.experiment_id || item.id}`)}
                                            sx={{ p: 2 }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar sx={{ bgcolor: '#eff6ff', color: 'primary.main', borderRadius: 2, width: 40, height: 40 }}>
                                                        <LocalFireDepartment fontSize="small" />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{item.kiln_name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(item.created_at).toLocaleDateString('th-TH')}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                                <Chip
                                                    label={item.quality_grade || 'กำลังเผา'}
                                                    color={getGradeColor(item.quality_grade)}
                                                    size="small"
                                                    sx={{ fontWeight: 800, borderRadius: 1.5 }}
                                                />
                                            </Box>

                                            <Divider sx={{ my: 1, borderStyle: 'dashed', opacity: 0.5 }} />

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Stack direction="row" spacing={2}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                        <Timer sx={{ fontSize: 16, mr: 0.5, opacity: 0.6 }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{item.burn_hours || '-'} ชม.</Typography>
                                                    </Box>
                                                    {item.charcoal_weight > 0 && (
                                                        <>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                                                                <Scale sx={{ fontSize: 16, mr: 0.5 }} />
                                                                <Typography variant="caption" sx={{ fontWeight: 800 }}>{item.charcoal_weight} กก.</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                                                                <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                                                                <Typography variant="caption" sx={{ fontWeight: 900 }}>{item.yield_percent?.toFixed(1) || 0}%</Typography>
                                                            </Box>
                                                        </>
                                                    )}
                                                </Stack>
                                                <KeyboardArrowRight sx={{ color: 'text.disabled' }} />
                                            </Box>
                                        </CardActionArea>
                                    </Paper>
                                ))
                            ) : (
                                <Paper sx={{ textAlign: 'center', py: 8, borderRadius: 4, bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                                    <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>ไม่พบข้อมูลการเผา</Typography>
                                </Paper>
                            )}
                        </Stack>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}
