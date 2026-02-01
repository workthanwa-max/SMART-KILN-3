import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Grid, Stack,
    Button, Divider, Chip, CircularProgress, Fade, Avatar
} from '@mui/material';
import {
    ArrowBack,
    CalendarMonth,
    Person,
    LocalFireDepartment
} from '@mui/icons-material';
import { experimentApi } from '../../api';
import Sidebar from '../../components/Sidebar';

const drawerWidth = 280;

export default function ResearcherExperimentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            experimentApi.getDetail(id)
                .then(res => setData(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id]);
    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'ดี': return 'success';
            case 'พอใช้': return 'warning';
            case 'แย่': return 'error';
            default: return 'primary';
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </Box>
    );

    if (!data) return <Typography>ไม่พบข้อมูล</Typography>;

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Sidebar />

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Container maxWidth="lg">
                    <Fade in timeout={600}>
                        <Box>
                            <Button
                                startIcon={<ArrowBack />}
                                onClick={() => navigate(-1)}
                                sx={{ mb: 4, color: 'text.secondary', fontWeight: 700 }}
                            >
                                กลับหน้ารายการ
                            </Button>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5 }}>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                                        รายละเอียดการเผาถ่าน #{data.experiment_id}
                                    </Typography>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Chip
                                            icon={<CalendarMonth />}
                                            label={new Date(data.created_at).toLocaleString('th-TH')}
                                            variant="outlined"
                                            sx={{ borderRadius: 2, fontWeight: 600 }}
                                        />
                                        <Chip
                                            label={data.quality_grade ? "เสร็จสมบูรณ์" : "กำลังดำเนินการ"}
                                            color={data.quality_grade ? "success" : "warning"}
                                            sx={{ borderRadius: 2, fontWeight: 700 }}
                                        />
                                    </Stack>
                                </Box>
                            </Box>

                            <Grid container spacing={4}>
                                {/* Basic Info */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0', height: '100%' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>ข้อมูลทั่วไป</Typography>
                                        <Stack spacing={3}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>เตาเผาที่ใช้</Typography>
                                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}><LocalFireDepartment /></Avatar>
                                                    <Typography sx={{ fontWeight: 700 }}>{data.kiln_name}</Typography>
                                                </Stack>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>ผู้ปฏิบัติงาน</Typography>
                                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                                    <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main' }}><Person /></Avatar>
                                                    <Typography sx={{ fontWeight: 700 }}>{data.operator_name}</Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Results Info */}
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>ผลการดำเนินงาน</Typography>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 6, sm: 1.5 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ถ่านรวม</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>{data.charcoal_weight || 0} <small>กก.</small></Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6, sm: 1.5 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Yield %</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 950, mt: 1, color: 'success.main' }}>
                                                    {data.yield_percent?.toFixed(1) || 0}%
                                                </Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6, sm: 1.5 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>เวลาเผา</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>{data.burn_hours || 0} <small>ชม.</small></Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6, sm: 1.5 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ความชื้นก่อนเผา</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>{data.initial_moisture || 'ไม่มีข้อมูล'}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6, sm: 1.5 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ความชื้นหลังเผา</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>{data.final_moisture || 'ไม่มีข้อมูล'}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6, sm: 2 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>จำนวนกระสอบ</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>{data.bag_count || 0} <small>ใบ</small></Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6, sm: 2.5 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>คุณภาพถ่าน</Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Chip
                                                        label={data.quality_grade || 'รอดำเนินการ'}
                                                        color={getGradeColor(data.quality_grade)}
                                                        sx={{ fontWeight: 800, fontSize: '0.9rem', height: 32 }}
                                                    />
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 6, sm: 2 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>อุณหภูมิ</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, mt: 1, color: '#ef4444' }}>{data.temperature || '-'} <small>°C</small></Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6, sm: 2 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>น้ำส้มควันไม้</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, mt: 1, color: '#f59e0b' }}>{data.wood_vinegar_quantity || '-'} <small>ลิตร</small></Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 4 }} />

                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>สรุปบันทึกการเผา</Typography>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc' }}>
                                            <Typography variant="body2" sx={{ fontStyle: data.summary_note ? 'normal' : 'italic', color: data.summary_note ? 'text.primary' : 'text.secondary' }}>
                                                {data.summary_note || 'ไม่มีข้อมูลบันทึก'}
                                            </Typography>
                                        </Paper>
                                    </Paper>
                                </Grid>

                                {/* Materials Info */}
                                <Grid size={{ xs: 12 }}>
                                    <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>วัตถุดิบที่ใช้ (ไม้ฟืน)</Typography>
                                        <Stack spacing={2}>
                                            {data.materials?.length === 0 ? (
                                                <Typography color="text.secondary">ไม่มีข้อมูลวัตถุดิบ</Typography>
                                            ) : data.materials?.map((m: any, idx: number) => (
                                                <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar sx={{ bgcolor: '#f1f5f9', color: 'text.primary' }}>{idx + 1}</Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 700 }}>{m.wood_type}</Typography>
                                                            <Typography variant="caption" color="text.secondary">ความชื้น/สภาพ: {m.condition === 'dry' ? 'ไม้แห้ง' : m.condition === 'fresh' ? 'ไม้สด' : 'ไม่มีข้อมูล'}</Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>{m.quantity} กก.</Typography>
                                                </Paper>
                                            ))}
                                        </Stack>
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
