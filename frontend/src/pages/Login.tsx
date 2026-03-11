import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, TextField, Button,
    Alert, CircularProgress, InputAdornment, Fade, Stack, IconButton,
    Zoom, Grid, Avatar
} from '@mui/material';
import {
    PhoneIphone,
    LocalFireDepartment,
    VerifiedUser,
    LockOutlined,
    Visibility,
    VisibilityOff,
    KeyboardDoubleArrowRight,
    SafetyCheck
} from '@mui/icons-material';
import { authApi } from '../api';

export default function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('user_role');
        if (token && role) {
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else if (role === 'researcher') {
                navigate('/researcher-dashboard');
            } else {
                navigate('/operator/dashboard');
            }
        }
    }, [navigate]);

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validatePhone = (num: string) => /^[0-9]{10}$/.test(num);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePhone(phone)) {
            setError('กรุณาระบุเบอร์โทรศัพท์ให้ครบ 10 หลัก');
            return;
        }
        if (!password) {
            setError('กรุณากรอกรหัสผ่าน');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await authApi.login(phone, password);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user_role', res.data.user.role);
            localStorage.setItem('user_name', res.data.user.name);
            localStorage.setItem('user_id', String(res.data.user.id));

            if (res.data.user.must_change_password) {
                navigate('/change-password', { state: { fromLogin: true } });
                return;
            }

            if (res.data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (res.data.user.role === 'researcher') {
                navigate('/researcher-dashboard');
            } else {
                navigate('/operator/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: '#FDFBF7', // Neutral Warm Cream
            overflow: 'hidden',
        }}>
            {/* Organic Background Elements */}
            <Box sx={{
                position: 'absolute', width: '800px', height: '800px',
                background: 'radial-gradient(circle, rgba(62, 39, 35, 0.05) 0%, transparent 70%)',
                top: '-200px', left: '-200px', borderRadius: '50%',
                filter: 'blur(80px)'
            }} />
            <Box sx={{
                position: 'absolute', width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(46, 125, 50, 0.04) 0%, transparent 70%)',
                bottom: '-150px', right: '-150px', borderRadius: '50%',
                filter: 'blur(60px)'
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container sx={{
                    minHeight: { xs: 'auto', md: '650px' },
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 40px 100px -20px rgba(62, 39, 35, 0.12)',
                    bgcolor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #EFEBE9'
                }}>
                    {/* Left Side: Branding (Visible on Desktop) */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        justifyContent: 'center',
                        p: 8,
                        background: 'linear-gradient(180deg, #3E2723 0%, #1B0000 100%)', // Deep Charcoal
                        borderRight: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <Fade in timeout={1000}>
                            <Box>
                                <Box sx={{
                                    width: 80, height: 80,
                                    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', // Forest Green
                                    color: 'white',
                                    borderRadius: 5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 20px 40px -10px rgba(46, 125, 50, 0.4)',
                                    mb: 4
                                }}>
                                    <LocalFireDepartment sx={{ fontSize: 44 }} />
                                </Box>
                                <Typography variant="h2" sx={{
                                    fontWeight: 950, color: '#fff', mb: 2,
                                    letterSpacing: -2, lineHeight: 1
                                }}>
                                    Smart Charcoal <br />
                                    <Box component="span" sx={{ color: '#A5D6A7' }}>Nature-Tech</Box>
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, mb: 4, maxWidth: '400px', lineHeight: 1.6 }}>
                                    นวัตกรรมการผลิตถ่านคุณภาพสูง ผสมผสานภูมิปัญญาชาวบ้านและเทคโนโลยีการวิจัยที่ยั่งยืน
                                </Typography>

                                <Stack spacing={2}>
                                    {[
                                        { icon: <SafetyCheck sx={{ color: '#A5D6A7' }} />, text: 'ระบบยืนยันตัวตนที่ใช้งานง่าย' },
                                        { icon: <VerifiedUser sx={{ color: '#A5D6A7' }} />, text: 'บันทึกข้อมูลและวิเคราะห์ผลลัพธ์แบบแม่นยำ' },
                                    ].map((item, i) => (
                                        <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                                            {item.icon}
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                                                {item.text}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        </Fade>
                    </Grid>

                    {/* Right Side: Login Form */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{
                        bgcolor: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        p: { xs: 4, sm: 8 }
                    }}>
                        <Zoom in timeout={600}>
                            <Box>
                                {/* Mobile Logo */}
                                <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, borderRadius: 3, boxShadow: '0 10px 20px -5px rgba(62, 39, 35, 0.2)' }}>
                                        <LocalFireDepartment fontSize="large" />
                                    </Avatar>
                                </Box>

                                <Box sx={{ mb: 6, textAlign: { xs: 'center', md: 'left' } }}>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 1, letterSpacing: -1 }}>
                                        ยินดีต้อนรับครับ
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        เข้าสู่ระบบบันทึกข้อมูลการผลิตถ่าน
                                    </Typography>
                                </Box>

                                {error && (
                                    <Alert severity="error" sx={{ mb: 4, borderRadius: 4, fontWeight: 700, bgcolor: '#fef2f2', border: '1px solid #fee2e2' }}>
                                        {error}
                                    </Alert>
                                )}

                                <Box component="form" onSubmit={handleLogin}>
                                    <Stack spacing={3}>
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: 'primary.main', ml: 1 }}>เบอร์โทรศัพท์</Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="ระบุเบอร์โทรศัพท์ 10 หลัก"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                                inputProps={{ maxLength: 10, inputMode: 'tel' }}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start"><PhoneIphone sx={{ color: 'primary.main', opacity: 0.8 }} /></InputAdornment>,
                                                    sx: {
                                                        borderRadius: 4,
                                                        bgcolor: '#FDFBF7',
                                                        fontWeight: 700,
                                                        '& fieldset': { border: '2px solid #EFEBE9' },
                                                        '&:hover fieldset': { borderColor: 'primary.main' }
                                                    }
                                                }}
                                            />
                                        </Box>

                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: 'primary.main', ml: 1 }}>รหัสผ่าน</Typography>
                                            <TextField
                                                fullWidth
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: 'primary.main', opacity: 0.8 }} /></InputAdornment>,
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94a3b8' }}>
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    sx: {
                                                        borderRadius: 4,
                                                        bgcolor: '#FDFBF7',
                                                        fontWeight: 700,
                                                        '& fieldset': { border: '2px solid #EFEBE9' },
                                                        '&:hover fieldset': { borderColor: 'primary.main' }
                                                    }
                                                }}
                                            />
                                        </Box>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            type="submit"
                                            disabled={loading}
                                            endIcon={!loading && <KeyboardDoubleArrowRight />}
                                            sx={{
                                                py: 2.5,
                                                mt: 2,
                                                borderRadius: 5,
                                                fontSize: '1.25rem',
                                                fontWeight: 900,
                                                textTransform: 'none',
                                                bgcolor: 'primary.main',
                                                boxShadow: '0 20px 40px -10px rgba(62, 39, 35, 0.3)',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 25px 50px -12px rgba(62, 39, 35, 0.4)'
                                                },
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }}
                                        >
                                            {loading ? <CircularProgress size={30} color="inherit" /> : 'เข้าสู่ระบบ'}
                                        </Button>

                                        <Typography variant="caption" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary', fontWeight: 600 }}>
                                            พบปัญหาการใช้งาน? ติดต่อเจ้าหน้าที่วิจัย <br />
                                            © 2026 Smart Charcoal Optimization
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Box>
                        </Zoom>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}