import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Paper, Stack,
    Chip, Button, CircularProgress, Fade, Grid, Avatar, Divider, IconButton
} from '@mui/material';
import {
    BarChart, NoteAlt, EditNote, CalendarMonth, ArrowBack, Forest
} from '@mui/icons-material';
import { experimentApi } from '../../api';

export default function ExperimentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await experimentApi.getDetail(Number(id));
                setData(res.data);
            } catch (err) {
                console.error("Error fetching detail:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </Box>
    );

    if (!data) return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h6">ไม่พบข้อมูล</Typography>
        </Box>
    );

    const isFinished = data.quality_grade !== null;

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'ดี': return 'success';
            case 'พอใช้': return 'warning';
            case 'แย่': return 'error';
            default: return 'info';
        }
    };

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 4 }}>
            {/* Header */}
            <Box sx={{
                bgcolor: 'white', borderBottom: '1px solid #e2e8f0', py: 2, px: 2,
                position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 1
            }}>
                <IconButton onClick={() => navigate(-1)} size="small"><ArrowBack /></IconButton>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>รายละเอียด #{data.experiment_id}</Typography>
            </Box>

            <Container maxWidth="sm" sx={{ mt: 3 }}>
                <Fade in timeout={800}>
                    <Box>
                        {/* Summary Status Card */}
                        <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0', mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>รายการ #{data.experiment_id}</Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                        <CalendarMonth sx={{ fontSize: 16 }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {new Date(data.created_at).toLocaleDateString('th-TH')}
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Chip
                                    label={isFinished ? `คุณภาพ ${data.quality_grade}` : 'กำลังเผา'}
                                    color={getGradeColor(data.quality_grade)}
                                    size="small"
                                    sx={{ fontWeight: 800, borderRadius: 1.5 }}
                                />
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            {/* Fixed Grid v2 usage with 'size' */}
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>เตาเผา</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{data.kiln_name}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>เวลาเผา</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{data.burn_hours || '-'} ชม.</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Divider sx={{ my: 1 }} />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ความชื้นก่อนเผา</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{data.initial_moisture || 'ไม่มีข้อมูล'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ความชื้นหลังเผา</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{data.final_moisture || 'ไม่มีข้อมูล'}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Material Info */}
                        <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0', mb: 3 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#fff7ed', color: '#f97316', width: 32, height: 32 }}>
                                    <Forest fontSize="small" />
                                </Avatar>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>วัตถุดิบไม้</Typography>
                            </Stack>
                            {data.materials?.map((m: any, idx: number) => (
                                <Box key={idx}>
                                    <Typography variant="body1" sx={{ fontWeight: 800 }}>{m.wood_type}</Typography>
                                    <Typography variant="body2" color="text.secondary">ปริมาณ {m.quantity} กก. | ไม้{m.condition === 'dry' ? 'แห้ง' : 'สด'}</Typography>
                                </Box>
                            ))}
                        </Paper>

                        {/* Results Card */}
                        <Paper sx={{
                            p: 3, borderRadius: 5, border: '1px solid #e2e8f0',
                            bgcolor: isFinished ? 'white' : '#eff6ff',
                            mb: 3
                        }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#eff6ff', color: 'primary.main', width: 32, height: 32 }}>
                                    <BarChart fontSize="small" />
                                </Avatar>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>ผลลัพธ์การคัดแยก</Typography>
                            </Stack>

                            {isFinished ? (
                                <Box>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>น้ำหนักถ่านรวม</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                                {data.charcoal_weight} <Box component="span" sx={{ fontSize: '0.9rem' }}>กก.</Box>
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ผลผลิต (Yield)</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 950, color: 'success.main' }}>
                                                {data.yield_percent?.toFixed(1) || 0}%
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>จากไม้ {data.total_wood_weight || 0} กก.</Typography>
                                        </Box>
                                    </Stack>

                                    <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>อุณหภูมิสูงสุด</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ef4444' }}>
                                                {data.temperature ? `${data.temperature} °C` : '-'}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>น้ำส้มควันไม้</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                                                {data.wood_vinegar_quantity ? `${data.wood_vinegar_quantity} ลิตร` : '-'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ) : (
                                <Box sx={{ py: 1 }}>
                                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 700 }}>รอสรุปผล...</Typography>
                                    <Button
                                        fullWidth variant="contained" size="small"
                                        startIcon={<EditNote fontSize="small" />}
                                        onClick={() => navigate(`/operator/finish-burn/${data.experiment_id}`)}
                                        sx={{ borderRadius: 2.5, fontWeight: 800, textTransform: 'none' }}
                                    >
                                        สรุปผลตอนนี้
                                    </Button>
                                </Box>
                            )}
                        </Paper>

                        {/* Note */}
                        <Paper sx={{ p: 2, borderRadius: 4, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <NoteAlt sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>หมายเหตุ</Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ fontStyle: data.summary_note ? 'normal' : 'italic', color: data.summary_note ? 'text.primary' : 'text.secondary' }}>
                                {data.summary_note || 'ไม่มีข้อมูลเพิ่มเติม'}
                            </Typography>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}