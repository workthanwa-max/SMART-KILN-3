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
            if (role === 'researcher') {
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

            if (res.data.user.role === 'researcher') {
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
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            overflow: 'hidden',
        }}>
            {/* Dynamic Background Elements */}
            <Box sx={{
                position: 'absolute', width: '800px', height: '800px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                top: '-200px', left: '-200px', borderRadius: '50%',
                filter: 'blur(80px)'
            }} />
            <Box sx={{
                position: 'absolute', width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
                bottom: '-150px', right: '-150px', borderRadius: '50%',
                filter: 'blur(60px)'
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container sx={{
                    minHeight: { xs: 'auto', md: '650px' },
                    borderRadius: 10,
                    overflow: 'hidden',
                    boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)',
                    bgcolor: 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {/* Left Side: Branding (Visible on Desktop) */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        justifyContent: 'center',
                        p: 8,
                        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                        borderRight: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <Fade in timeout={1000}>
                            <Box>
                                <Box sx={{
                                    width: 80, height: 80,
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: 'white',
                                    borderRadius: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.5)',
                                    mb: 4
                                }}>
                                    <LocalFireDepartment sx={{ fontSize: 44 }} />
                                </Box>
                                <Typography variant="h2" sx={{
                                    fontWeight: 950, color: '#fff', mb: 2,
                                    letterSpacing: -2, lineHeight: 1
                                }}>
                                    Smart Charcoal <br />
                                    <Box component="span" sx={{ color: '#60a5fa' }}>Optimization</Box>
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500, mb: 4, maxWidth: '400px', lineHeight: 1.6 }}>
                                    ระบบบริหารจัดการและเพิ่มประสิทธิภาพการผลิตถ่านด้วยเทคโนโลยีบันทึกข้อมูลแบบเรียลไทม์
                                </Typography>

                                <Stack spacing={2}>
                                    {[
                                        { icon: <SafetyCheck sx={{ color: '#10b981' }} />, text: 'ระบบยืนยันตัวตนความปลอดภัยสูง' },
                                        { icon: <VerifiedUser sx={{ color: '#3b82f6' }} />, text: 'บันทึกข้อมูลวิจัยครบถ้วนแม่นยำ' },
                                    ].map((item, i) => (
                                        <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                                            {item.icon}
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
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
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, borderRadius: 2, boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)' }}>
                                        <LocalFireDepartment fontSize="large" />
                                    </Avatar>
                                </Box>

                                <Box sx={{ mb: 6, textAlign: { xs: 'center', md: 'left' } }}>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mb: 1, letterSpacing: -1 }}>
                                        ยินดีต้อนรับกลับมา
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                                        เข้าสู่ระบบเพื่อจัดการข้อมูลของคุณ
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
                                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: '#334155', ml: 1 }}>เบอร์โทรศัพท์ (UID)</Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="08XXXXXXXX"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                                inputProps={{ maxLength: 10, inputMode: 'tel' }}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start"><PhoneIphone sx={{ color: 'primary.main', opacity: 0.8 }} /></InputAdornment>,
                                                    sx: {
                                                        borderRadius: 4,
                                                        bgcolor: '#f8fafc',
                                                        fontWeight: 700,
                                                        '& fieldset': { border: '2px solid #e2e8f0' },
                                                        '&:hover fieldset': { borderColor: 'primary.main' }
                                                    }
                                                }}
                                            />
                                        </Box>

                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: '#334155', ml: 1 }}>รหัสผ่านความปลอดภัย</Typography>
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
                                                        bgcolor: '#f8fafc',
                                                        fontWeight: 700,
                                                        '& fieldset': { border: '2px solid #e2e8f0' },
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
                                                borderRadius: 4,
                                                fontSize: '1.2rem',
                                                fontWeight: 900,
                                                textTransform: 'none',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.5)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.6)'
                                                },
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&.Mui-disabled': { bgcolor: '#cbd5e1' }
                                            }}
                                        >
                                            {loading ? <CircularProgress size={30} color="inherit" /> : 'ลงชื่อเข้าใช้งานระบบ'}
                                        </Button>

                                        <Typography variant="caption" sx={{ mt: 3, textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                                            หากมีปัญหาในการเข้าใช้งาน กรุณาติดต่อผู้ดูแลระบบวิจัย <br />
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