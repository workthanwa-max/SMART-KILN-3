import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Typography, Divider,
    Avatar, Stack, Tooltip, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import {
    Dashboard,
    Science,
    People,
    LocalFireDepartment,
    Assignment,
    History,
    AddCircleOutline,
    AccountCircle,
    BarChart,
    Map,
    Forest,
    Logout,
    WarningAmber
} from '@mui/icons-material';

const drawerWidth = 280;

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = localStorage.getItem('user_role');
    const userName = localStorage.getItem('user_name') || 'User';
    const [logoutOpen, setLogoutOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const researcherLinks = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/researcher-dashboard' },
        { text: 'สรุปรายงานประจำปี', icon: <BarChart />, path: '/annual-report' },
        { text: 'รายการการเผาทั้งหมด', icon: <Science />, path: '/master-list' },
        { text: 'แผนที่เตาเผา', icon: <Map />, path: '/kiln-map' },
        { text: 'จัดการสมาชิก', icon: <People />, path: '/manage-users' },
        { text: 'จัดการเตาเผา', icon: <LocalFireDepartment />, path: '/manage-kilns' },
        { text: 'จัดการพันธุ์ไม้', icon: <Forest />, path: '/manage-wood-species' },
        { text: 'มอบหมายงาน', icon: <Assignment />, path: '/assign-kilns' },
        { text: 'โปรไฟล์ของฉัน', icon: <AccountCircle />, path: '/profile' },
    ];

    const operatorLinks = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/operator/dashboard' },
        { text: 'เริ่มการเผาถ่าน', icon: <AddCircleOutline />, path: '/operator/start-burn' },
        { text: 'ประวัติของฉัน', icon: <History />, path: '/operator/history' },
        { text: 'โปรไฟล์ของฉัน', icon: <AccountCircle />, path: '/profile' },
    ];

    const links = userRole === 'researcher' ? researcherLinks : operatorLinks;

    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid #EFEBE9',
                        bgcolor: '#ffffff'
                    },
                }}
            >
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                        <Box sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            p: 1.2,
                            borderRadius: 3,
                            display: 'flex',
                            boxShadow: '0 4px 12px rgba(62, 39, 35, 0.2)'
                        }}>
                            <LocalFireDepartment />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -0.5 }}>
                            SMART KILN
                        </Typography>
                    </Stack>
                </Box>

                <Divider sx={{ mx: 2, opacity: 0.5 }} />

                <Box sx={{ p: 3 }}>
                    <Paper elevation={0} sx={{
                        p: 2,
                        borderRadius: 5,
                        bgcolor: 'background.default',
                        border: '1px solid #EFEBE9'
                    }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44, boxShadow: '0 4px 10px rgba(46, 125, 50, 0.2)' }}>
                                <AccountCircle />
                            </Avatar>
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }} noWrap>
                                    {userName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                                    {userRole}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Box>

                <List sx={{ px: 2, mt: 1 }}>
                    {links.map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 4,
                                    py: 1.8,
                                    px: 2.5,
                                    bgcolor: isActive(item.path) ? 'rgba(90, 108, 87, 0.08)' : 'transparent',
                                    color: isActive(item.path) ? 'primary.dark' : 'text.secondary',
                                    '&:hover': {
                                        bgcolor: isActive(item.path) ? 'rgba(90, 108, 87, 0.12)' : 'background.default',
                                    },
                                    transition: 'all 0.2s',
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 40,
                                    color: isActive(item.path) ? 'primary.dark' : 'text.secondary',
                                    opacity: isActive(item.path) ? 1 : 0.7
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        sx: { fontWeight: isActive(item.path) ? 900 : 700, fontSize: '0.95rem' }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Box sx={{ mt: 'auto', p: 3 }}>
                    <Divider sx={{ mb: 2, opacity: 0.5 }} />
                    <Tooltip title="ออกจากระบบ">
                        <ListItemButton
                            onClick={() => setLogoutOpen(true)}
                            sx={{
                                borderRadius: 3,
                                color: 'error.main',
                                '&:hover': { bgcolor: '#FFF5F5' }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                <Logout />
                            </ListItemIcon>
                            <ListItemText
                                primary="ออกจากระบบ"
                                primaryTypographyProps={{ sx: { fontWeight: 700, fontSize: '0.9rem' } }}
                            />
                        </ListItemButton>
                    </Tooltip>
                </Box>
            </Drawer>

            {/* Logout Confirmation Dialog */}
            <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)} PaperProps={{ sx: { borderRadius: 5, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 900, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <WarningAmber sx={{ color: 'error.main' }} />
                    ออกจากระบบ
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        คุณต้องการออกจากระบบใช่หรือไม่?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setLogoutOpen(false)} variant="outlined" sx={{ borderRadius: 3, fontWeight: 800, textTransform: 'none' }}>ยกเลิก</Button>
                    <Button onClick={handleLogout} variant="contained" color="error" sx={{ borderRadius: 3, fontWeight: 800, textTransform: 'none' }}>ออกจากระบบ</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
