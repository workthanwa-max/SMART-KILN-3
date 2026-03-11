import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container, Box, Typography, Paper, TextField, Button,
    Stack, CircularProgress, Alert, InputAdornment,
    ToggleButton, ToggleButtonGroup, Fade, IconButton, Grid
} from '@mui/material';
import { Inventory, Scale, Timer, ArrowBack } from '@mui/icons-material';
import { experimentApi } from '../../api';

export default function FinishBurn() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [bagCount, setBagCount] = useState<number | string>(0);
    const [weight, setWeight] = useState<number | string>(0);
    const [quality, setQuality] = useState<string>('ดี');
    const [burnHours, setBurnHours] = useState<number | string>(8);
    const [finalMoisture, setFinalMoisture] = useState<string>('แห้งสนิท');
    const [woodVinegarQuantity, setWoodVinegarQuantity] = useState<number | string>(0);
    const [temperature, setTemperature] = useState<number | string>(0);
    const [note, setNote] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        const nWeight = Number(weight);
        const nBagCount = Number(bagCount);
        const nBurnHours = Number(burnHours);
        const nWoodVinegarQuantity = Number(woodVinegarQuantity);
        const nTemperature = Number(temperature);

        if (nWeight < 0 || nBagCount < 0 || nBurnHours < 0 || nWoodVinegarQuantity < 0) {
            setError("ค่าที่กรอกห้ามติดลบ (ปริมาณน้ำส้มควันไม้)");
            return;
        }

        setLoading(true);
        setError('');
        try {
            await experimentApi.updateResult(Number(id), {
                charcoal_weight: nWeight,
                bag_count: nBagCount,
                burn_hours: nBurnHours,
                quality_grade: quality as 'ดี' | 'พอใช้' | 'แย่',
                final_moisture: finalMoisture,
                summary_note: note.trim(),
                wood_vinegar_quantity: nWoodVinegarQuantity,
                temperature: nTemperature
            });
            navigate('/operator/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "ไม่สามารถบันทึกผลได้");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
            {/* Header */}
            <Box sx={{
                bgcolor: 'white',
                borderBottom: '1px solid #EFEBE9',
                py: 2.5,
                px: 2,
                position: 'sticky',
                top: 0,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                <IconButton onClick={() => navigate(-1)} size="large" sx={{ color: 'primary.main' }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>สรุปผลการเผา #{id}</Typography>
            </Box>

            <Container maxWidth="sm" sx={{ mt: 3 }}>
                <Fade in timeout={800}>
                    <Box component="form" onSubmit={handleSubmit}>
                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

                        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0' }}>
                            <Stack spacing={3}>
                                {/* Fixed Grid v2 usage with 'size' */}
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 800, color: 'text.secondary' }}>ระยะเวลาเผา (ชม.)</Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            value={burnHours}
                                            onChange={(e) => setBurnHours(e.target.value)}
                                            inputProps={{ min: 0, step: "1" }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><Timer fontSize="small" color="primary" /></InputAdornment>,
                                                sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 800, color: 'text.secondary' }}>น้ำหนัก (กก.)</Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            inputProps={{ min: 0, step: "0.1" }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><Scale fontSize="small" color="primary" /></InputAdornment>,
                                                sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                {/* New fields */}
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 800, color: 'text.secondary' }}>ปริมาณน้ำส้มควันไม้ (ลิตร)</Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            value={woodVinegarQuantity}
                                            onChange={(e) => setWoodVinegarQuantity(e.target.value)}
                                            inputProps={{ min: 0, step: "0.1" }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">ลิตร</InputAdornment>,
                                                sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 800, color: 'text.secondary' }}>อุณหภูมิ (C°)</Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            value={temperature}
                                            onChange={(e) => setTemperature(e.target.value)}
                                            inputProps={{ step: "0.1" }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">C°</InputAdornment>,
                                                sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                <Box>
                                    <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 800, color: 'text.secondary' }}>จำนวนกระสอบ (ใบ)</Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        value={bagCount}
                                        onChange={(e) => setBagCount(e.target.value)}
                                        inputProps={{ min: 0, step: "1" }}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Inventory fontSize="small" color="primary" /></InputAdornment>,
                                            sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="caption" sx={{ mb: 2.5, display: 'block', fontWeight: 800, color: 'text.secondary' }}>ความชื้นของถ่าน (ความรู้สึก)</Typography>
                                    <ToggleButtonGroup
                                        value={finalMoisture}
                                        exclusive
                                        onChange={(_, val) => val && setFinalMoisture(val)}
                                        fullWidth
                                        color="primary"
                                        sx={{
                                            '& .MuiToggleButton-root': {
                                                borderRadius: 3, py: 1.5, fontWeight: 800,
                                                margin: 0.5,
                                                border: '1px solid #e2e8f0',
                                                '&.Mui-selected': { bgcolor: 'primary.main', color: 'white' }
                                            }
                                        }}
                                    >
                                        <ToggleButton value="แห้งสนิท">แห้งสนิท</ToggleButton>
                                        <ToggleButton value="มีความชื้น">มีความชื้น</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="caption" sx={{ mb: 2.5, display: 'block', fontWeight: 800, color: 'text.secondary' }}>คุณภาพถ่าน (เกรด)</Typography>
                                    <ToggleButtonGroup
                                        value={quality}
                                        exclusive
                                        onChange={(_, newVal) => newVal && setQuality(newVal)}
                                        fullWidth
                                        color="primary"
                                        sx={{
                                            '& .MuiToggleButton-root': {
                                                borderRadius: 3,
                                                margin: 0.5,
                                                py: 1.5,
                                                fontWeight: 800,
                                                border: '1px solid #e2e8f0',
                                                '&.Mui-selected': {
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    '&:hover': { bgcolor: 'primary.dark' }
                                                }
                                            }
                                        }}
                                    >
                                        <ToggleButton value="ดี">ดี</ToggleButton>
                                        <ToggleButton value="พอใช้">พอใช้</ToggleButton>
                                        <ToggleButton value="แย่">แย่</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 800, color: 'text.secondary' }}>บันทึกเพิ่มเติม</Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="ระบุปัญหาหรือข้อสังเกต..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        InputProps={{
                                            sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                                        }}
                                    />
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    type="submit"
                                    disabled={loading}
                                    sx={{
                                        py: 2.5,
                                        borderRadius: 5,
                                        fontWeight: 900,
                                        fontSize: '1.4rem',
                                        bgcolor: 'success.main',
                                        boxShadow: '0 12px 24px rgba(67, 160, 71, 0.2)',
                                        '&:hover': { bgcolor: 'success.dark' },
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'บันทึกงานเสร็จสิ้น 🏁'}
                                </Button>
                            </Stack>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}