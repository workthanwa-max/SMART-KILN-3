import { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Button, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem,
    Avatar, Tooltip, CircularProgress, Fade, Grid, InputAdornment,
    Divider
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import {
    PersonAdd,
    Edit,
    ToggleOn,
    ToggleOff,
    Engineering,
    Science,
    Search,
    VpnKey,
    LockReset,
    Group,
    VerifiedUser
} from '@mui/icons-material';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { syncService } from '../../services/syncService';
import { userApi } from '../../api';
import Sidebar from '../../components/Sidebar';

const drawerWidth = 280;

export default function ManageUsers() {
    const users = useLiveQuery(() => db.users.toArray()) || [];
    const [loading] = useState(false); // No longer purely loading from API
    const [showModal, setShowModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resettingUser, setResettingUser] = useState<any>(null);
    const [newPassword, setNewPassword] = useState('123456');
    const [editingUser, setEditingUser] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', phone: '', role: 'operator', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        // We still trigger a sync attempt when visiting the page
        syncService.pullFromServer();
        syncService.syncPendingChanges();
    }, []);

    const stats = {
        total: users.length,
        researchers: users.filter(u => u.role === 'researcher').length,
        operators: users.filter(u => u.role === 'operator').length,
        active: users.filter(u => u.is_active).length
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.phone.includes(search);
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' ? u.is_active : !u.is_active);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await db.users.update(editingUser.user_id, {
                    name: formData.name,
                    phone: formData.phone,
                    role: formData.role as any,
                    sync_status: 'pending_update'
                });
            } else {
                await db.users.add({
                    name: formData.name,
                    phone: formData.phone,
                    role: formData.role as any,
                    is_active: 1,
                    sync_status: 'pending_create'
                });
            }
            closeModal();
            syncService.syncPendingChanges(); // Try to sync immediately
        } catch (err: any) {
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลลงเครื่อง");
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resettingUser) return;

        const isOnline = await syncService.isOnline();
        if (!isOnline) {
            alert("ขออภัย: การรีเซ็ตรหัสผ่านจำเป็นต้องเชื่อมต่ออินเทอร์เน็ต");
            return;
        }

        try {
            await userApi.resetPassword(resettingUser.user_id, newPassword);

            await db.users.update(resettingUser.user_id, {
                must_change_password: 1,
                sync_status: 'synced'
            });

            alert(`รีเซ็ตรหัสผ่านเรียบร้อยแล้ว รหัสใหม่คือ: ${newPassword}`);
            closeResetModal();
        } catch (err: any) {
            console.error('Reset Password Error:', err);
            alert("เกิดข้อผิดพลาด: " + (err.response?.data?.error || "ไม่สามารถรีเซ็ตรหัสผ่านได้"));
        }
    };

    const toggleStatus = async (user: any) => {
        if (!window.confirm(`ยืนยันการ${user.is_active ? 'ปิด' : 'เปิด'}ใช้งานคุณ ${user.name}?`)) return;
        try {
            await db.users.update(user.user_id, {
                is_active: user.is_active === 1 ? 0 : 1,
                sync_status: 'pending_update'
            });
            syncService.syncPendingChanges();
        } catch (err) { console.error(err); }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({ name: '', phone: '', role: 'operator', password: '' });
        setShowPassword(false);
    };

    const closeResetModal = () => {
        setShowResetModal(false);
        setResettingUser(null);
        setNewPassword('123456');
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Sidebar />

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Container maxWidth="xl">
                    <Fade in timeout={600}>
                        <Box>
                            {/* Header */}
                            <Box sx={{ mb: 6 }}>
                                <Grid container justifyContent="space-between" alignItems="center" spacing={3}>
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Typography variant="h3" sx={{ fontWeight: 950, color: '#0f172a', letterSpacing: -1 }}>
                                            👥 จัดการสมาชิก
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5, opacity: 0.8 }}>
                                            บริหารจัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และสถาณะระบบ
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={<PersonAdd />}
                                            onClick={() => setShowModal(true)}
                                            sx={{
                                                borderRadius: 4,
                                                px: 4,
                                                py: 2,
                                                fontWeight: 800,
                                                fontSize: '1.1rem',
                                                boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)',
                                                textTransform: 'none'
                                            }}
                                        >
                                            เพิ่มผู้ใช้ใหม่
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Stat Summary Cards */}
                            <Grid container spacing={3} sx={{ mb: 6 }}>
                                {[
                                    { label: 'สมาชิกทั้งหมด', value: stats.total, icon: <Group />, color: '#6366f1' },
                                    { label: 'นักวิจัย (Researcher)', value: stats.researchers, icon: <Science />, color: '#3b82f6' },
                                    { label: 'ผู้ปฏิบัติงาน (Operator)', value: stats.operators, icon: <Engineering />, color: '#10b981' },
                                    { label: 'เปิดใช้งานอยู่', value: stats.active, icon: <VerifiedUser />, color: '#f59e0b' },
                                ].map((s, idx) => (
                                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={idx}>
                                        <Paper sx={{
                                            p: 3,
                                            borderRadius: 6,
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2.5
                                        }}>
                                            <Avatar sx={{
                                                bgcolor: `${s.color}15`,
                                                color: s.color,
                                                width: 56, height: 56,
                                                borderRadius: 4
                                            }}>
                                                {s.icon}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    {s.label}
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b' }}>
                                                    {s.value}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Filters & Table Section */}
                            <Paper sx={{
                                borderRadius: 8,
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
                                overflow: 'hidden',
                                bgcolor: '#ffffff'
                            }}>
                                <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', bgcolor: '#fcfcfd' }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={{ xs: 12, md: 5 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="ค้นชื่อ, นามสกุล หรือหมายเลขโทรศัพท์..."
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                InputProps={{
                                                    startAdornment: <Search sx={{ mr: 1, color: '#94a3b8' }} />,
                                                    sx: { borderRadius: 4, bgcolor: '#ffffff' }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 2.5 }}>
                                            <TextField
                                                select fullWidth size="small"
                                                label="บทบาททั้งหมด"
                                                value={filterRole}
                                                onChange={e => setFilterRole(e.target.value)}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#ffffff' } }}
                                            >
                                                <MenuItem value="all">บทบาททั้งหมด</MenuItem>
                                                <MenuItem value="researcher">Researcher</MenuItem>
                                                <MenuItem value="operator">Operator</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 2.5 }}>
                                            <TextField
                                                select fullWidth size="small"
                                                label="สถานะ"
                                                value={filterStatus}
                                                onChange={e => setFilterStatus(e.target.value)}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#ffffff' } }}
                                            >
                                                <MenuItem value="all">สถานะทั้งหมด</MenuItem>
                                                <MenuItem value="active">Active (ใช้งานปรกติ)</MenuItem>
                                                <MenuItem value="disabled">Disabled (ปิดชั่วคราว)</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: 'right' }}>
                                            <Button
                                                variant="text"
                                                color="inherit"
                                                onClick={() => { setSearch(''); setFilterRole('all'); setFilterStatus('all'); }}
                                                sx={{ fontWeight: 700, color: '#64748b' }}
                                            >
                                                ล้างตัวกรอง
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <TableContainer>
                                    <Table sx={{ minWidth: 800 }}>
                                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 800, color: '#64748b', py: 2.5 }}>ชื่อสมาชิก / UID</TableCell>
                                                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>บทบาทหน้าที่</TableCell>
                                                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>ติดต่อ</TableCell>
                                                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>สถานะการใช้งาน</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b', pr: 4 }}>จัดการบัญชี</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ py: 15 }}>
                                                        <CircularProgress thickness={5} size={45} />
                                                        <Typography variant="body1" sx={{ mt: 2, fontWeight: 700, color: 'text.secondary' }}>กำลังจัดการข้อมูลสมาชิก...</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredUsers.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ py: 15 }}>
                                                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 800 }}>ไม่พบข้อมูสมาชิกระบบ</Typography>
                                                        <Typography variant="body2" color="text.secondary">ลองเปลี่ยนเงื่อนไขการค้นหาของคุณใหม่อีกครั้ง</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredUsers.map((u) => (
                                                <TableRow key={u.user_id} hover sx={{ transition: '0.2s', '&:hover': { bgcolor: '#f8fafc' } }}>
                                                    <TableCell sx={{ py: 2.5 }}>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Avatar sx={{
                                                                bgcolor: u.role === 'researcher' ? '#eff6ff' : '#f0fdf4',
                                                                color: u.role === 'researcher' ? '#3b82f6' : '#10b981',
                                                                width: 50, height: 50,
                                                                borderRadius: 4,
                                                                border: '2px solid',
                                                                borderColor: 'divider'
                                                            }}>
                                                                {u.role === 'researcher' ? <Science /> : <Engineering />}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>{u.name}</Typography>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8' }}>ID: {u.user_id}</Typography>
                                                                    {u.must_change_password === 1 && (
                                                                        <Chip label="รอยืนยันรหัส" size="small" color="warning" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 900, borderRadius: 1 }} />
                                                                    )}
                                                                </Stack>
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={u.role === 'researcher' ? 'RESEARCHER' : 'OPERATOR'}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 900,
                                                                borderRadius: 1.5,
                                                                letterSpacing: 0.5,
                                                                fontSize: '0.7rem',
                                                                bgcolor: u.role === 'researcher' ? '#3b82f6' : '#64748b',
                                                                color: '#fff'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{u.phone}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={u.is_active ? <ToggleOn /> : <ToggleOff />}
                                                            label={u.is_active ? "พร้อมใช้งาน" : "ระงับการใช้"}
                                                            onClick={() => toggleStatus(u)}
                                                            sx={{
                                                                fontWeight: 800,
                                                                bgcolor: u.is_active ? '#ecfdf5' : '#fef2f2',
                                                                color: u.is_active ? '#059669' : '#dc2626',
                                                                border: '1px solid',
                                                                borderColor: u.is_active ? '#10b981' : '#f87171',
                                                                cursor: 'pointer',
                                                                '&:hover': { bgcolor: u.is_active ? '#d1fae5' : '#fee2e2' }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ pr: 4 }}>
                                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                            <Tooltip title="รีเซ็ตรหัสผ่าน">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => { setResettingUser(u); setShowResetModal(true); }}
                                                                    sx={{ bgcolor: '#fff7ed', color: '#ea580c', '&:hover': { bgcolor: '#ea580c', color: '#fff' } }}
                                                                >
                                                                    <LockReset fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="แก้ไขโปรไฟล์">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        setEditingUser(u);
                                                                        setFormData({ name: u.name, phone: u.phone, role: u.role, password: '' });
                                                                        setShowModal(true);
                                                                    }}
                                                                    sx={{ bgcolor: '#f1f5f9', color: '#64748b', '&:hover': { bgcolor: 'primary.main', color: '#fff' } }}
                                                                >
                                                                    <Edit fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            {/* Modal Form */}
            <Dialog
                open={showModal} onClose={closeModal}
                fullWidth maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 6, p: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } }}
            >
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', pt: 3, px: 3, fontSize: '1.5rem' }}>
                        {editingUser ? '📝 แก้ไขข้อมูลโปรไฟล์' : '👤 เพิ่มสมาชิกใหม่'}
                    </DialogTitle>
                    <DialogContent sx={{ px: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
                            {editingUser ? 'ปรับปรุงข้อมูลของสมาชิก หรือเปลี่ยนสิทธิ์การเข้าถึงระบบ' : 'ลงชื่อสมาชิกใหม่เข้าสู่ระบบ พร้อมกำหนดรหัสผ่านเบื้องต้น'}
                        </Typography>
                        <Stack spacing={3}>
                            <TextField
                                label="ชื่อ-นามสกุล" fullWidth required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                InputProps={{ sx: { borderRadius: 4, fontWeight: 700 } }}
                            />
                            <TextField
                                label="หมายเลขโทรศัพท์ (Login)" fullWidth required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                InputProps={{ sx: { borderRadius: 4, fontWeight: 700 } }}
                            />
                            {!editingUser && (
                                <TextField
                                    label="รหัสผ่านเข้าเครื่อง"
                                    type={showPassword ? 'text' : 'password'}
                                    fullWidth required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    InputProps={{
                                        sx: { borderRadius: 4, fontWeight: 700 },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                            <TextField
                                select label="มอบหมายตำแหน่ง" fullWidth
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                InputProps={{ sx: { borderRadius: 4, fontWeight: 700 } }}
                            >
                                <MenuItem value="operator">
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.5 }}>
                                        <Engineering sx={{ color: '#059669' }} />
                                        <Typography sx={{ fontWeight: 700 }}>ผู้ปฏิบัติงาน (Operator)</Typography>
                                    </Stack>
                                </MenuItem>
                                <MenuItem value="researcher">
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.5 }}>
                                        <Science sx={{ color: '#3b82f6' }} />
                                        <Typography sx={{ fontWeight: 700 }}>นักวิจัย (Researcher)</Typography>
                                    </Stack>
                                </MenuItem>
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 4 }}>
                        <Button onClick={closeModal} variant="text" sx={{ fontWeight: 700, color: 'text.secondary' }}>ยกเลิก</Button>
                        <Button type="submit" variant="contained" size="large" sx={{ borderRadius: 4, px: 5, fontWeight: 800 }}>
                            {editingUser ? 'อัปเดตข้อมูล' : 'สร้างบัญชี'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* Reset Password Modal */}
            <Dialog
                open={showResetModal} onClose={closeResetModal}
                fullWidth maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 6, p: 1 } }}
            >
                <Box component="form" onSubmit={handleResetPassword}>
                    <DialogTitle sx={{ fontWeight: 900, color: '#e11d48', pt: 3, px: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LockReset fontSize="large" /> รีเซ็ตรหัสผ่าน
                    </DialogTitle>
                    <Divider sx={{ mx: 3 }} />
                    <DialogContent sx={{ px: 3, pt: 3 }}>
                        <Typography variant="body1" sx={{ mb: 3, fontWeight: 700 }}>
                            ระบบจะตั้งรหัสผ่านใหม่ให้กับสมาชิก: <span style={{ color: '#3b82f6' }}>{resettingUser?.name}</span>
                        </Typography>
                        <TextField
                            label="รหัสผ่านใหม่" fullWidth required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            helperText="* สมาชิกต้องเปลี่ยนรหัสนี้ในการเข้าสู่ระบบครั้งหน้า"
                            InputProps={{
                                startAdornment: <VpnKey sx={{ mr: 1, color: '#94a3b8' }} />,
                                sx: { borderRadius: 4, fontWeight: 800 }
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 4 }}>
                        <Button onClick={closeResetModal} variant="text" sx={{ fontWeight: 700, color: 'text.secondary' }}>ปิดหน้าต่าง</Button>
                        <Button type="submit" variant="contained" color="warning" size="large" sx={{ borderRadius: 4, px: 5, fontWeight: 800 }}>
                            ยืนยันการเปลี่ยนรหัส
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}



