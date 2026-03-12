import { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Chip,
    Button, Stack, TextField, Fade, CircularProgress,
    MenuItem, FormControl, InputLabel, Select, Grid,
    Avatar, IconButton, Tooltip, Zoom, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
    Search,
    CalendarMonth,
    Visibility,
    FilterList,
    LocalFireDepartment,
    TrendingUp,
    AssignmentOutlined,
    Science,
    GridView,
    TableRows
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { experimentApi, kilnApi } from '../../api';
import Sidebar from '../../components/Sidebar';

const drawerWidth = 280;

export default function ExperimentList() {
    const navigate = useNavigate();
    const [experiments, setExperiments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterKiln, setFilterKiln] = useState('all');
    const [filterGrade, setFilterGrade] = useState('all');
    const [kilns, setKilns] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    useEffect(() => {
        loadExperiments();
    }, []);

    const loadExperiments = async () => {
        setLoading(true);
        try {
            const [expRes, kilnRes] = await Promise.all([
                experimentApi.getAll(),
                kilnApi.getAll()
            ]);
            setExperiments(expRes.data);
            setKilns(kilnRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const filteredList = experiments.filter(e => {
        const matchesSearch = (
            e.kiln_name?.toLowerCase().includes(search.toLowerCase()) ||
            e.operator_name?.toLowerCase().includes(search.toLowerCase()) ||
            e.summary_note?.toLowerCase().includes(search.toLowerCase())
        );
        const matchesKiln = filterKiln === 'all' || e.kiln_name === filterKiln;
        const matchesGrade = filterGrade === 'all' ||
            (filterGrade === 'Pending' ? !e.quality_grade : e.quality_grade === filterGrade);

        return matchesSearch && matchesKiln && matchesGrade;
    });

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'ดี': return { bg: '#ecfdf5', text: '#065f46', border: '#10b981' };
            case 'พอใช้': return { bg: '#fffbeb', text: '#92400e', border: '#f59e0b' };
            case 'แย่': return { bg: '#fef2f2', text: '#991b1b', border: '#f87171' };
            default: return { bg: '#f8fafc', text: '#475569', border: '#cbd5e1' };
        }
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
            <Sidebar />

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Container maxWidth="xl">
                    <Fade in timeout={600}>
                        <Box>
                            {/* Header Section */}
                            <Box sx={{ mb: 6 }}>
                                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
                                    <Box>
                                        <Typography variant="h3" sx={{ fontWeight: 950, color: 'primary.main', letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Science sx={{ fontSize: 45, color: 'secondary.main' }} />
                                            รายการบันทึกการเผา
                                        </Typography>
                                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, mt: 0.5, opacity: 0.8 }}>
                                            ฐานข้อมูลการวิจัยและการทดลองคุณภาพถ่านทั้งหมด
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Button
                                            onClick={() => setViewMode('grid')}
                                            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                                            startIcon={<GridView />}
                                            size="small"
                                            sx={{
                                                borderRadius: 3,
                                                fontWeight: 800,
                                                px: 2,
                                                border: '1px solid',
                                                borderColor: 'primary.main',
                                                '&:hover': {
                                                    bgcolor: viewMode === 'grid' ? 'primary.dark' : 'rgba(150, 167, 141, 0.08)'
                                                }
                                            }}
                                        >
                                            การ์ด
                                        </Button>
                                        <Button
                                            onClick={() => setViewMode('table')}
                                            variant={viewMode === 'table' ? 'contained' : 'outlined'}
                                            startIcon={<TableRows />}
                                            size="small"
                                            sx={{
                                                borderRadius: 3,
                                                fontWeight: 800,
                                                px: 2,
                                                border: '1px solid',
                                                borderColor: 'primary.main',
                                                '&:hover': {
                                                    bgcolor: viewMode === 'table' ? 'primary.dark' : 'rgba(150, 167, 141, 0.08)'
                                                }
                                            }}
                                        >
                                            ตาราง
                                        </Button>

                                        <Paper sx={{ p: 0.5, borderRadius: 4, display: 'flex', border: '1px solid #EFEBE9', bgcolor: '#ffffff', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                                            <IconButton onClick={loadExperiments} color="secondary"><TrendingUp /></IconButton>
                                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                                            <Typography variant="body2" sx={{ alignSelf: 'center', px: 2, fontWeight: 900, color: 'primary.main' }}>
                                                รวม {filteredList.length} รายการ
                                            </Typography>
                                        </Paper>
                                    </Stack>
                                </Stack>

                                {/* Filter Bar */}
                                <Paper sx={{ p: 2, borderRadius: 4, mb: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <TextField
                                                fullWidth size="small"
                                                placeholder="ค้นหาตามชื่อเตา, นวัตกร, บันทึก..."
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                InputProps={{
                                                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                                                    sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>เลือกเตาเผา</InputLabel>
                                                <Select
                                                    value={filterKiln}
                                                    label="เลือกเตาเผา"
                                                    onChange={e => setFilterKiln(e.target.value)}
                                                    sx={{ borderRadius: 3, bgcolor: '#f8fafc' }}
                                                >
                                                    <MenuItem value="all">ทุกเตาเผา</MenuItem>
                                                    {kilns.map(k => (
                                                        <MenuItem key={k.id} value={k.name}>{k.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>เกรดคุณภาพ</InputLabel>
                                                <Select
                                                    value={filterGrade}
                                                    label="เกรดคุณภาพ"
                                                    onChange={e => setFilterGrade(e.target.value)}
                                                    sx={{ borderRadius: 3, bgcolor: 'background.default' }}
                                                >
                                                    <MenuItem value="all">ทุกคุณภาพ</MenuItem>
                                                    <MenuItem value="ดี">คุณภาพ ดี</MenuItem>
                                                    <MenuItem value="พอใช้">คุณภาพ พอใช้</MenuItem>
                                                    <MenuItem value="แย่">คุณภาพ แย่</MenuItem>
                                                    <MenuItem value="Pending">รอดำเนินการ</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }} sx={{ textAlign: 'right' }}>
                                            <Button
                                                startIcon={<FilterList />}
                                                onClick={() => { setSearch(''); setFilterKiln('all'); setFilterGrade('all'); }}
                                                sx={{ fontWeight: 700 }}
                                            >
                                                ล้างตัวกรอง
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>

                            {/* Content Section */}
                            {loading ? (
                                <Box sx={{ textAlign: 'center', py: 10 }}>
                                    <CircularProgress thickness={5} size={60} />
                                    <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>กำลังโหลดบันทึกการวิจัย...</Typography>
                                </Box>
                            ) : filteredList.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 12, bgcolor: '#ffffff', borderRadius: 8, border: '2px dashed #e2e8f0' }}>
                                    <AssignmentOutlined sx={{ fontSize: 80, color: '#94a3b8', mb: 2 }} />
                                    <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 800 }}>ไม่พบรายการที่คุณต้องการ</Typography>
                                    <Typography color="text.secondary">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง</Typography>
                                </Box>
                            ) : viewMode === 'grid' ? (
                                <Grid container spacing={3}>
                                    {filteredList.map((exp, idx) => {
                                        const gradeStyle = getGradeColor(exp.quality_grade);
                                        return (
                                            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={exp.experiment_id}>
                                                <Zoom in style={{ transitionDelay: `${idx * 50}ms` }}>
                                                    <Paper
                                                        onClick={() => navigate(`/researcher/experiment/${exp.experiment_id}`)}
                                                        sx={{
                                                            p: 0,
                                                            borderRadius: 7,
                                                            overflow: 'hidden',
                                                            border: '1px solid #EFEBE9',
                                                            boxShadow: '0 10px 20px -5px rgba(62, 39, 35, 0.05)',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            cursor: 'pointer',
                                                            bgcolor: '#ffffff',
                                                            position: 'relative',
                                                            '&:hover': {
                                                                transform: 'translateY(-12px)',
                                                                boxShadow: '0 25px 35px -10px rgba(62, 39, 35, 0.15)',
                                                                borderColor: 'secondary.main',
                                                                '& .view-btn': { opacity: 1, transform: 'translateX(0)' }
                                                            }
                                                        }}
                                                    >
                                                        {/* Card Badge/Status */}
                                                        <Box sx={{
                                                            px: 3, pt: 3, pb: 2,
                                                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                                                        }}>
                                                            <Avatar sx={{ bgcolor: 'primary.main', borderRadius: '14px', width: 48, height: 48 }}>
                                                                <LocalFireDepartment />
                                                            </Avatar>
                                                            {exp.quality_grade ? (
                                                                <Tooltip title={`คุณภาพระดับ: ${exp.quality_grade}`}>
                                                                    <Chip
                                                                        label={exp.quality_grade}
                                                                        sx={{
                                                                            bgcolor: gradeStyle.bg,
                                                                            color: gradeStyle.text,
                                                                            border: `1px solid ${gradeStyle.border}`,
                                                                            fontWeight: 900,
                                                                            px: 1
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            ) : (
                                                                <Chip label="รอดำเนินการ" variant="outlined" sx={{ fontWeight: 700 }} />
                                                            )}
                                                        </Box>

                                                        {/* Main Info */}
                                                        <Box sx={{ px: 3, pb: 3 }}>
                                                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5 }}>
                                                                {exp.kiln_name}
                                                            </Typography>
                                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                                                <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }} />
                                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800, fontSize: '0.75rem' }}>
                                                                    {new Date(exp.created_at).toLocaleDateString('th-TH', {
                                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                                    })}
                                                                </Typography>
                                                            </Stack>

                                                            <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2, borderRadius: 5, mb: 3, border: '1px solid #EFEBE9' }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid size={{ xs: 4 }}>
                                                                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, textTransform: 'uppercase', display: 'block', mb: 0.5, opacity: 0.6 }}>น้ำหนัก</Typography>
                                                                        <Typography variant="body1" sx={{ fontWeight: 950, color: 'primary.main' }}>
                                                                            {exp.charcoal_weight ? `${exp.charcoal_weight} กก.` : '-'}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Divider orientation="vertical" flexItem sx={{ my: 1 }} />
                                                                    <Grid size={{ xs: 3.5 }} sx={{ px: 1 }}>
                                                                        <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 900, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Yield %</Typography>
                                                                        <Typography variant="body1" sx={{ fontWeight: 950, color: 'secondary.main' }}>
                                                                            {exp.yield_percent ? `${exp.yield_percent.toFixed(1)}%` : '-'}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Divider orientation="vertical" flexItem sx={{ my: 1 }} />
                                                                    <Grid size={{ xs: 4 }} sx={{ pl: 1 }}>
                                                                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, textTransform: 'uppercase', display: 'block', mb: 0.5, opacity: 0.6 }}>นวัตกร</Typography>
                                                                        <Typography variant="body2" noWrap sx={{ fontWeight: 800, color: 'primary.main' }}>
                                                                            {exp.operator_name.split(' ')[0]}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Paper>


                                                            {exp.summary_note && (
                                                                <Typography variant="body2" color="text.secondary" sx={{
                                                                    lineHeight: 1.6,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    mb: 2,
                                                                    fontStyle: 'italic'
                                                                }}>
                                                                    "{exp.summary_note}"
                                                                </Typography>
                                                            )}
                                                        </Box>

                                                        {/* Footer Action */}
                                                        <Box sx={{
                                                            p: 2, bg: '#f8fafc',
                                                            borderTop: '1px solid #f1f5f9',
                                                            display: 'flex', justifyContent: 'flex-end',
                                                            bgcolor: '#f8fafc'
                                                        }}>
                                                            <Button
                                                                size="small"
                                                                className="view-btn"
                                                                endIcon={<Visibility sx={{ fontSize: 16 }} />}
                                                                sx={{
                                                                    fontWeight: 800,
                                                                    textTransform: 'none',
                                                                    opacity: 0.7,
                                                                    transform: 'translateX(5px)',
                                                                    transition: '0.2s'
                                                                }}
                                                            >
                                                                ดูผลการวิจัย
                                                            </Button>
                                                        </Box>
                                                    </Paper>
                                                </Zoom>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            ) : (
                                <TableContainer component={Paper} sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #EFEBE9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 900 }}>วันที่</TableCell>
                                                <TableCell sx={{ fontWeight: 900 }}>ชื่อเตา</TableCell>
                                                <TableCell sx={{ fontWeight: 900 }}>นวัตกร</TableCell>
                                                <TableCell sx={{ fontWeight: 900 }}>น้ำหนัก (กก.)</TableCell>
                                                <TableCell sx={{ fontWeight: 900 }}>Yield (%)</TableCell>
                                                <TableCell sx={{ fontWeight: 900 }}>เกรดคุณภาพ</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 900 }}>การจัดการ</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredList.map((exp) => {
                                                const gradeStyle = getGradeColor(exp.quality_grade);
                                                return (
                                                    <TableRow
                                                        key={exp.experiment_id}
                                                        hover
                                                        onClick={() => navigate(`/researcher/experiment/${exp.experiment_id}`)}
                                                        sx={{ cursor: 'pointer' }}
                                                    >
                                                        <TableCell sx={{ fontWeight: 700 }}>
                                                            {new Date(exp.created_at).toLocaleDateString('th-TH')}
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 900, color: 'primary.main' }}>{exp.kiln_name}</TableCell>
                                                        <TableCell>{exp.operator_name}</TableCell>
                                                        <TableCell sx={{ fontWeight: 800 }}>{exp.charcoal_weight || '-'}</TableCell>
                                                        <TableCell sx={{ fontWeight: 800, color: 'secondary.main' }}>
                                                            {exp.yield_percent ? `${exp.yield_percent.toFixed(1)}%` : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {exp.quality_grade ? (
                                                                <Chip
                                                                    size="small"
                                                                    label={exp.quality_grade}
                                                                    sx={{
                                                                        bgcolor: gradeStyle.bg,
                                                                        color: gradeStyle.text,
                                                                        border: `1px solid ${gradeStyle.border}`,
                                                                        fontWeight: 900,
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Chip size="small" label="รอดำเนินการ" variant="outlined" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <IconButton size="small" color="primary">
                                                                <Visibility sx={{ fontSize: 20 }} />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </Fade>
                </Container>
            </Box>
        </Box>
    );
}
