import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Paper, TextField, Button,
    MenuItem, Slider, Stack, CircularProgress,
    Alert, InputAdornment, Fade, IconButton, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { LocalFireDepartment, Forest, ArrowBack } from '@mui/icons-material';
import { experimentApi } from '../../api';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

export default function StartBurn() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedKiln, setSelectedKiln] = useState('');
    const [woodType, setWoodType] = useState('ไม้เบญจพรรณ');
    const [woodQuantity, setWoodQuantity] = useState(50);
    const [initialMoisture, setInitialMoisture] = useState('ไม้สด');

    const userId = Number(localStorage.getItem('user_id'));

    // Fetch kilns from Local DB (User Assignments)
    const myAssignments = useLiveQuery(() =>
        userId ? db.user_kilns.where('user_id').equals(userId).toArray() : []
        , [userId]) || [];

    const kilns = useLiveQuery(async () => {
        if (!myAssignments.length) return [];
        const kilnIds = myAssignments.map(uk => uk.kiln_id);
        return db.kilns.where('kiln_id').anyOf(kilnIds).and(k => k.is_active === 1).toArray();
    }, [myAssignments]) || [];

    useEffect(() => {
        if (kilns.length > 0 && !selectedKiln) {
            setSelectedKiln(String(kilns[0].kiln_id));
        }
        setFetchLoading(false);
    }, [kilns]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedKiln) return setError("กรุณาเลือกเตาที่ใช้งาน");

        const nQuantity = Number(woodQuantity);
        if (nQuantity <= 0) {
            setError("ปริมาณไม้ต้องมากกว่า 0");
            return;
        }

        setLoading(true);
        try {
            const expRes = await experimentApi.create({
                kiln_id: Number(selectedKiln),
                initial_moisture: initialMoisture
            });
            const expId = expRes.data?.experiment_id || expRes.data?.id;
            await experimentApi.addMaterial(expId, {
                wood_type: woodType,
                quantity: nQuantity,
                condition: 'dry'
            });
            navigate('/operator/dashboard' + expId);
        } catch (err: any) {
            setError(err.response?.data?.error || 'บันทึกข้อมูลไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 4 }}>
            {/* Mobile Header */}
            <Box sx={{
                bgcolor: 'white', borderBottom: '1px solid #e2e8f0', py: 2, px: 2,
                position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 1
            }}>
                <IconButton onClick={() => navigate(-1)} size="small"><ArrowBack /></IconButton>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>เริ่มการเผาใหม่</Typography>
            </Box>

            <Container maxWidth="sm" sx={{ mt: 3 }}>
                <Fade in timeout={800}>
                    <Box component="form" onSubmit={handleSubmit}>
                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

                        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0' }}>
                            <Stack spacing={4}>
                                <Box>
                                    <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 800, color: 'text.secondary' }}>1. เลือกเตาที่ใช้งาน</Typography>
                                    <TextField
                                        select fullWidth value={selectedKiln}
                                        onChange={(e) => setSelectedKiln(e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LocalFireDepartment color="primary" fontSize="small" /></InputAdornment>,
                                            sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                                        }}
                                        error={kilns.length === 0}
                                        helperText={kilns.length === 0 ? "ยังไม่ได้รับมอบหมายเตา" : ""}
                                    >
                                        {kilns.map((k) => (
                                            <MenuItem key={k.kiln_id} value={String(k.kiln_id)}>
                                                {k.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 800, color: 'text.secondary' }}>2. ชนิดไม้</Typography>
                                    <TextField
                                        select fullWidth value={woodType}
                                        onChange={(e) => setWoodType(e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Forest color="primary" fontSize="small" /></InputAdornment>,
                                            sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                                        }}
                                    >
                                        {['ไม้เบญจพรรณ', 'ไม้โกงกาง', 'ไม้เงาะ', 'ไม้ยูคาลิปตัส'].map(opt => (
                                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                        ))}
                                    </TextField>
                                </Box>

                                <Box sx={{ px: 1 }}>
                                    <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 800, color: 'text.secondary' }}>
                                        3. ปริมาณไม้ (กก.)
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        value={woodQuantity}
                                        onChange={(e) => setWoodQuantity(e.target.value as any)}
                                        inputProps={{ min: 1, step: "1" }}
                                        InputProps={{
                                            sx: { borderRadius: 3, bgcolor: '#f8fafc', fontWeight: 800 }
                                        }}
                                        sx={{ mb: 2 }}
                                    />
                                    <Slider
                                        value={Number(woodQuantity) || 0}
                                        min={10} max={500} step={5}
                                        onChange={(_, val) => setWoodQuantity(val as number)}
                                        sx={{ color: 'primary.main' }}
                                    />
                                </Box>

                                <Box sx={{ px: 1 }}>
                                    <Typography variant="caption" sx={{ mb: 1.5, display: 'block', fontWeight: 800, color: 'text.secondary' }}>
                                        4. ความชื้นของเนื้อไม้ (ความรู้สึก)
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={initialMoisture}
                                        exclusive
                                        onChange={(_, val) => val && setInitialMoisture(val)}
                                        fullWidth
                                        color="primary"
                                        sx={{
                                            '& .MuiToggleButton-root': {
                                                borderRadius: 3, py: 1.5, fontWeight: 800,
                                                border: '1px solid #e2e8f0',
                                                '&.Mui-selected': { bgcolor: 'primary.main', color: 'white' }
                                            }
                                        }}
                                    >
                                        <ToggleButton value="ไม้สด">ไม้สด</ToggleButton>
                                        <ToggleButton value="ไม้หมาด">ไม้หมาด</ToggleButton>
                                        <ToggleButton value="ไม้แห้ง">ไม้แห้ง</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                <Button
                                    fullWidth variant="contained" size="large" type="submit"
                                    disabled={loading}
                                    sx={{
                                        py: 2, borderRadius: 4, fontWeight: 900, fontSize: '1.1rem',
                                        boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)'
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'เริ่มการเผาถ่าน 🔥'}
                                </Button>
                            </Stack>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}