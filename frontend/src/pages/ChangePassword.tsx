import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Paper, Typography, TextField, Button,
    Alert, CircularProgress, InputAdornment, Fade, Stack, IconButton,
    Avatar, Container
} from '@mui/material';
import {
    LockOutlined,
    VpnKey,
    Visibility,
    VisibilityOff,
    CheckCircleOutline,
    ArrowBack,
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
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            p: 2
        }}>
            {/* Decorative blobs */}
            <Box sx={{
                position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(62, 39, 35, 0.06) 0%, transparent 70%)',
                top: -120, left: -120, filter: 'blur(40px)'
            }} />
            <Box sx={{
                position: 'absolute', width: 350, height: 350, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(46, 125, 50, 0.06) 0%, transparent 70%)',
                bottom: -80, right: -80, filter: 'blur(40px)'
            }} />

            <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                <Fade in timeout={800}>
                    <Paper elevation={0} sx={{
                        p: { xs: 4, sm: 5 },
                        borderRadius: 8,
                        border: '1px solid #EFEBE9',
                        boxShadow: '0 24px 60px -12px rgba(62, 39, 35, 0.12)',
                        bgcolor: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Top accent stripe */}
                        <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 6,
                            background: success
                                ? 'linear-gradient(90deg, #2E7D32, #43a047)'
                                : 'linear-gradient(90deg, #3E2723, #5D4037)'
                        }} />

                        {/* Back button (only when not from login) */}
                        {!fromLogin && (
                            <Box sx={{ mb: 1 }}>
                                <Button
                                    startIcon={<ArrowBack />}
                                    onClick={() => navigate(-1)}
                                    sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'none', px: 0 }}
                                >
                                    ย้อนกลับ
                                </Button>
                            </Box>
                        )}

                        {/* Header */}
                        <Stack alignItems="center" spacing={2} sx={{ mb: 4, mt: fromLogin ? 2 : 0 }}>
                            <Avatar sx={{
                                width: 72, height: 72,
                                bgcolor: success ? '#E8F5E9' : '#FBE9E7',
                                color: success ? 'secondary.main' : 'primary.main',
                                border: '2px solid',
                                borderColor: success ? '#C8E6C9' : '#EFEBE9',
                                boxShadow: '0 8px 20px rgba(62,39,35,0.08)'
                            }}>
                                {success
                                    ? <CheckCircleOutline sx={{ fontSize: 40 }} />
                                    : <Fingerprint sx={{ fontSize: 40 }} />
                                }
                            </Avatar>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h5" sx={{ fontWeight: 950, color: 'primary.main', letterSpacing: -0.5 }}>
                                    {success ? 'เปลี่ยนรหัสสำเร็จ' : 'ตั้งค่ารหัสผ่านใหม่'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5, lineHeight: 1.7 }}>
                                    {success
                                        ? 'กำลังพาคุณกลับสู่ระบบ...'
                                        : fromLogin
                                            ? 'กรุณากำหนดรหัสผ่านใหม่ก่อนเข้าใช้งานครั้งแรก'
                                            : 'กรอกรหัสผ่านใหม่ที่ต้องการ'
                                    }
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Error Alert */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 4, fontWeight: 700, border: '1px solid #FFCDD2' }}>
                                {error}
                            </Alert>
                        )}

                        {/* Success State */}
                        {success && (
                            <CircularProgress sx={{ display: 'block', mx: 'auto', color: 'secondary.main' }} />
                        )}

                        {/* Form */}
                        {!success && (
                            <Box component="form" onSubmit={handleChangePassword}>
                                <Stack spacing={3}>
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: 'primary.main', ml: 0.5 }}>
                                            รหัสผ่านใหม่
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="อย่างน้อย 6 ตัวอักษร"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <VpnKey sx={{ color: 'primary.main', opacity: 0.7 }} fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    borderRadius: 4,
                                                    bgcolor: 'background.default',
                                                    fontWeight: 700,
                                                    '& fieldset': { borderColor: '#EFEBE9' },
                                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                                    '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: 'primary.main', ml: 0.5 }}>
                                            ยืนยันรหัสผ่านอีกครั้ง
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockOutlined sx={{ color: 'primary.main', opacity: 0.7 }} fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.secondary' }}>
                                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    borderRadius: 4,
                                                    bgcolor: 'background.default',
                                                    fontWeight: 700,
                                                    '& fieldset': { borderColor: '#EFEBE9' },
                                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                                    '&.Mui-focused fieldset': { borderColor: 'primary.main' }
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
                                            py: 2,
                                            borderRadius: 4,
                                            fontSize: '1.1rem',
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            bgcolor: 'primary.main',
                                            boxShadow: '0 12px 28px rgba(62, 39, 35, 0.25)',
                                            '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-1px)' },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {loading
                                            ? <CircularProgress size={24} color="inherit" />
                                            : 'บันทึกรหัสผ่านใหม่'
                                        }
                                    </Button>
                                </Stack>
                            </Box>
                        )}
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
}
