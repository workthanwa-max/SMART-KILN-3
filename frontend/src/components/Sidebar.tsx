import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Typography, Divider,
    Avatar, Stack, Tooltip, Paper
} from '@mui/material';
import {
    Dashboard,
    Science,
    People,
    LocalFireDepartment,
    Assignment,
    Logout,
    History,
    AddCircleOutline,
    AccountCircle,
    BarChart
} from '@mui/icons-material';

const drawerWidth = 280;

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = localStorage.getItem('user_role');
    const userName = localStorage.getItem('user_name') || 'User';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const researcherLinks = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/researcher-dashboard' },
        { text: 'สรุปรายงานประจำปี', icon: <BarChart />, path: '/annual-report' },
        { text: 'รายการการเผาทั้งหมด', icon: <Science />, path: '/master-list' },
        { text: 'จัดการสมาชิก', icon: <People />, path: '/manage-users' },
        { text: 'จัดการเตาเผา', icon: <LocalFireDepartment />, path: '/manage-kilns' },
        { text: 'มอบหมายงาน', icon: <Assignment />, path: '/assign-kilns' },
    ];

    const operatorLinks = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/operator/dashboard' },
        { text: 'เริ่มการเผาถ่าน', icon: <AddCircleOutline />, path: '/operator/start-burn' },
        { text: 'ประวัติของฉัน', icon: <History />, path: '/operator/history' },
    ];

    const links = userRole === 'researcher' ? researcherLinks : operatorLinks;

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                display: { xs: 'none', sm: 'block' },
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: '1px solid #e2e8f0',
                    bgcolor: '#ffffff'
                },
            }}
        >
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                    <Box sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        p: 1,
                        borderRadius: 2,
                        display: 'flex'
                    }}>
                        <LocalFireDepartment />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        SMART KILN
                    </Typography>
                </Stack>
            </Box>

            <Divider sx={{ mx: 2, opacity: 0.5 }} />

            <Box sx={{ p: 3 }}>
                <Paper elevation={0} sx={{
                    p: 2,
                    borderRadius: 4,
                    bgcolor: '#f8fafc',
                    border: '1px solid #f1f5f9'
                }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                            <AccountCircle />
                        </Avatar>
                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }} noWrap>
                                {userName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
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
                                borderRadius: 3,
                                py: 1.5,
                                bgcolor: isActive(item.path) ? 'primary.light' : 'transparent',
                                color: isActive(item.path) ? 'primary.main' : '#64748b',
                                '&:hover': {
                                    bgcolor: isActive(item.path) ? 'primary.light' : '#f1f5f9',
                                },
                            }}
                        >
                            <ListItemIcon sx={{
                                minWidth: 40,
                                color: isActive(item.path) ? 'primary.main' : '#94a3b8'
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    sx: { fontWeight: isActive(item.path) ? 700 : 600, fontSize: '0.9rem' }
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
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 3,
                            color: 'error.main',
                            '&:hover': { bgcolor: '#fef2f2' }
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
    );
}
