import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Box, Paper, Typography, TextField, Button,
    Alert, CircularProgress, InputAdornment, Fade, Stack, IconButton,
    Zoom, Avatar
} from '@mui/material';
import {
    LockOutlined,
    VpnKey,
    Visibility,
    VisibilityOff,
    CheckCircleOutline,
    ErrorOutline,
    KeyboardReturn,
    Fingerprint
} from '@mui/icons-material';
import { authApi } from '../api';

export default function ChangePassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const fromLogin = location.state?.fromLogin;

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        setLoading(true);
        try {
            await authApi.changePassword(newPassword);
            setSuccess(true);
            setTimeout(() => {
                const role = localStorage.getItem('user_role');
                if (role === 'researcher') {
                    navigate('/researcher-dashboard');
                } else {
                    navigate('/operator/dashboard');
                }
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
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
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            overflow: 'hidden',
            p: 2
        }}>
            {/* Background Decorations */}
            <Box sx={{
                position: 'absolute', width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                top: '-150px', left: '-150px', borderRadius: '50%', filter: 'blur(50px)'
            }} />
            <Box sx={{
                position: 'absolute', width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
                bottom: '-100px', right: '-100px', borderRadius: '50%', filter: 'blur(40px)'
            }} />

            <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                <Fade in timeout={800}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, sm: 6 },
                            borderRadius: 10,
                            background: 'rgba(255, 255, 255, 1)',
                            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Status Stripe */}
                        <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 8,
                            background: success
                                ? 'linear-gradient(90deg, #10b981, #34d399)'
                                : 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                        }} />

                        <Box sx={{ mb: 5, textAlign: 'center' }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                                <Zoom in timeout={1000}>
                                    <Avatar sx={{
                                        width: 80, height: 80,
                                        bgcolor: success ? '#ecfdf5' : '#eff6ff',
                                        color: success ? '#10b981' : '#3b82f6',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                                        border: '1px solid',
                                        borderColor: success ? '#d1fae5' : '#dbeafe'
                                    }}>
                                        {success ? <CheckCircleOutline sx={{ fontSize: 48 }} /> : <Fingerprint sx={{ fontSize: 44 }} />}
                                    </Avatar>
                                </Zoom>
                                {success && (
                                    <Fade in timeout={1500}>
                                        <CircularProgress size={96} sx={{ position: 'absolute', top: -8, left: -8, color: '#10b981' }} thickness={2} />
                                    </Fade>
                                )}
                            </Box>

                            <Typography variant="h4" sx={{ fontWeight: 950, color: '#0f172a', mb: 1.5, letterSpacing: -1 }}>
                                {success ? 'เปลี่ยนรหัสสำเร็จ' : 'ตั้งค่ารหัสผ่านใหม่'}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600, lineHeight: 1.6 }}>
                                {success
                                    ? 'ระบบกำลังพาคุณเข้าสู่พื้นที่ทำงาน...'
                                    : fromLogin
                                        ? 'เพื่อความปลอดภัยสูงสุด กรุณากำหนดรหัสผ่านใหม่ก่อนเข้าใช้งานครั้งแรก'
                                        : 'กรุณากรอกรหัสผ่านใหม่ที่เป็นความลับของคุณ'
                                }
                            </Typography>
                        </Box>

                        {error && (
                            <Alert
                                severity="error"
                                icon={<ErrorOutline />}
                                sx={{ mb: 4, borderRadius: 4, fontWeight: 700, bgcolor: '#fef2f2', border: '1px solid #fee2e2' }}
                            >
                                {error}
                            </Alert>
                        )}

                        {!success && (
                            <Box component="form" onSubmit={handleChangePassword}>
                                <Stack spacing={3.5}>
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: '#334155', ml: 1 }}>รหัสผ่านใหม่</Typography>
                                        <TextField
                                            fullWidth
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><VpnKey sx={{ color: 'primary.main', opacity: 0.8 }} /></InputAdornment>,
                                                sx: {
                                                    borderRadius: 4,
                                                    bgcolor: '#f8fafc',
                                                    fontWeight: 700,
                                                    '& fieldset': { border: '2px solid #e2e8f0' }
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: '#334155', ml: 1 }}>ยืนยันรหัสผ่านอีกครั้ง</Typography>
                                        <TextField
                                            fullWidth
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                                    '& fieldset': { border: '2px solid #e2e8f0' }
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
                                        sx={{
                                            py: 2.5,
                                            borderRadius: 4,
                                            fontSize: '1.2rem',
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.4)',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.5)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {loading ? <CircularProgress size={30} color="inherit" /> : 'บันทึกและเริ่มต้นใช้งาน'}
                                    </Button>

                                    {!fromLogin && (
                                        <Button
                                            fullWidth
                                            variant="text"
                                            onClick={() => navigate(-1)}
                                            startIcon={<KeyboardReturn />}
                                            sx={{ fontWeight: 800, color: '#64748b' }}
                                        >
                                            ยกเลิกและย้อนกลับ
                                        </Button>
                                    )}
                                </Stack>
                            </Box>
                        )}
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
}
