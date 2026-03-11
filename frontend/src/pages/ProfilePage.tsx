import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Stack, Avatar,
    Button, Divider, Chip, Fade, CircularProgress, IconButton
} from '@mui/material';
import {
    Person, Phone, VpnKey,
    LocalFireDepartment, Science, ArrowBack,
    CalendarToday, VerifiedUser
} from '@mui/icons-material';
import { authApi } from '../api';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const userRole = localStorage.getItem('user_role') || '';
    const isResearcher = userRole === 'researcher';

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await authApi.getMe();
                setUser(res.data);
            } catch {
                setUser({
                    name: localStorage.getItem('user_name') || '-',
                    phone: '-',
                    role: userRole
                });
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const navigateBack = () => {
        navigate(isResearcher ? '/researcher-dashboard' : '/operator/dashboard');
    };

    if (loading) return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </Box>
    );

    const initials = (user?.name || '-').charAt(0).toUpperCase();
    const roleLabel = isResearcher ? 'นักวิจัย' : 'พนักงานปฏิบัติงาน';
    const roleColor = isResearcher ? '#5A6C57' : '#85A98F';

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
            {/* Sticky Header */}
            <Box sx={{
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(182, 206, 180, 0.4)',
                py: 2, px: 2,
                position: 'sticky', top: 0, zIndex: 10,
                display: 'flex', alignItems: 'center', gap: 2
            }}>
                <IconButton onClick={navigateBack} size="large" sx={{ color: 'primary.main' }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>โปรไฟล์ของฉัน</Typography>
            </Box>

            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Fade in timeout={700}>
                    <Box>
                        {/* Hero Avatar Card */}
                        <Paper elevation={0} sx={{
                            borderRadius: 8,
                            mb: 3,
                            overflow: 'hidden',
                            border: '1px solid rgba(182, 206, 180, 0.3)',
                            position: 'relative',
                        }}>
                            {/* Gradient Background */}
                            <Box sx={{
                                background: isResearcher
                                    ? 'linear-gradient(135deg, #5A6C57 0%, #85A98F 60%, #D3F1DF 100%)'
                                    : 'linear-gradient(135deg, #525B44 0%, #5A6C57 60%, #85A98F 100%)',
                                pt: 5, pb: 4, px: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                position: 'relative',
                            }}>
                                {/* Decorative blobs */}
                                <Box sx={{ position: 'absolute', top: -20, right: -20, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
                                <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />

                                <Avatar sx={{
                                    width: 100, height: 100,
                                    fontSize: '2.5rem', fontWeight: 900,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    border: '3px solid rgba(255,255,255,0.5)',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                    color: '#fff',
                                    zIndex: 1
                                }}>
                                    {initials}
                                </Avatar>

                                <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 950, color: '#fff', letterSpacing: -0.5 }}>
                                        {user?.name || '-'}
                                    </Typography>
                                    <Chip
                                        icon={isResearcher
                                            ? <Science sx={{ '&&': { color: '#fff', fontSize: 16 } }} />
                                            : <LocalFireDepartment sx={{ '&&': { color: '#fff', fontSize: 16 } }} />
                                        }
                                        label={roleLabel}
                                        size="small"
                                        sx={{
                                            mt: 1.5,
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: '#fff',
                                            fontWeight: 800,
                                            border: '1px solid rgba(255,255,255,0.4)',
                                            backdropFilter: 'blur(10px)',
                                            fontSize: '0.85rem',
                                            px: 1
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Info Rows */}
                            <Box sx={{ px: 3, pb: 1 }}>
                                <Stack spacing={0}>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 2.5 }}>
                                        <Avatar sx={{ bgcolor: '#EAF3E8', color: roleColor, width: 44, height: 44, borderRadius: 3 }}>
                                            <Person />
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.65rem' }}>ชื่อ-นามสกุล</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary' }}>{user?.name || '-'}</Typography>
                                        </Box>
                                    </Stack>

                                    <Divider sx={{ borderColor: 'rgba(182, 206, 180, 0.4)' }} />

                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 2.5 }}>
                                        <Avatar sx={{ bgcolor: '#EAF3E8', color: roleColor, width: 44, height: 44, borderRadius: 3 }}>
                                            <Phone />
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.65rem' }}>เบอร์โทรศัพท์ / รหัสผู้ใช้</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary' }}>{user?.phone || '-'}</Typography>
                                        </Box>
                                    </Stack>

                                    <Divider sx={{ borderColor: 'rgba(182, 206, 180, 0.4)' }} />

                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 2.5 }}>
                                        <Avatar sx={{ bgcolor: '#EAF3E8', color: roleColor, width: 44, height: 44, borderRadius: 3 }}>
                                            <VerifiedUser />
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.65rem' }}>บทบาทในระบบ</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                                {isResearcher ? 'นักวิจัย (Researcher)' : 'พนักงานปฏิบัติงาน (Operator)'}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label="Active"
                                            size="small"
                                            sx={{ bgcolor: '#D3F1DF', color: '#2E6B44', fontWeight: 800, border: '1px solid #85A98F' }}
                                        />
                                    </Stack>
                                </Stack>
                            </Box>
                        </Paper>

                        {/* Actions Section */}
                        <Paper elevation={0} sx={{
                            borderRadius: 6,
                            overflow: 'hidden',
                            border: '1px solid rgba(182, 206, 180, 0.3)',
                        }}>
                            <Box sx={{ p: 2.5 }}>
                                <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: 1.5, fontSize: '0.7rem' }}>
                                    การตั้งค่าบัญชี
                                </Typography>
                            </Box>
                            <Divider sx={{ borderColor: 'rgba(182, 206, 180, 0.4)' }} />
                            <Stack
                                direction="row"
                                spacing={0}
                                divider={<Divider orientation="vertical" flexItem />}
                            >
                                <Button
                                    fullWidth
                                    startIcon={<VpnKey />}
                                    onClick={() => navigate('/change-password')}
                                    sx={{
                                        py: 2.5,
                                        borderRadius: 0,
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        color: 'primary.main',
                                        fontSize: '0.95rem',
                                        '&:hover': { bgcolor: '#EAF3E8' }
                                    }}
                                >
                                    เปลี่ยนรหัสผ่าน
                                </Button>
                                <Button
                                    fullWidth
                                    startIcon={<CalendarToday />}
                                    onClick={navigateBack}
                                    sx={{
                                        py: 2.5,
                                        borderRadius: 0,
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        color: 'primary.main',
                                        fontSize: '0.95rem',
                                        '&:hover': { bgcolor: '#EAF3E8' }
                                    }}
                                >
                                    กลับหน้าหลัก
                                </Button>
                            </Stack>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}
