import { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Button, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem,
    Avatar, Tooltip, CircularProgress, Fade, Grid, InputAdornment
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    PersonAdd,
    Edit,
    ToggleOn,
    ToggleOff,
    Engineering,
    Science,
    Search,
    LockReset,
    Group,
    Shield,
    ArrowBack
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api';

export default function AdminManageUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await userApi.getAll();
            setUsers(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        researchers: users.filter(u => u.role === 'researcher').length,
        operators: users.filter(u => u.role === 'operator').length,
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
                await userApi.update(editingUser.user_id, {
                    name: formData.name,
                    phone: formData.phone,
                    role: formData.role
                });
            } else {
                await userApi.create(formData);
            }
            closeModal();
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resettingUser) return;
        try {
            await userApi.resetPassword(resettingUser.user_id, newPassword);
            alert(`รีเซ็ตรหัสผ่านเรียบร้อยแล้ว รหัสใหม่คือ: ${newPassword}`);
            closeResetModal();
        } catch (err: any) {
            alert(err.response?.data?.error || "ไม่สามารถรีเซ็ตรหัสผ่านได้");
        }
    };

    const toggleStatus = async (user: any) => {
        if (!window.confirm(`ยืนยันการ${user.is_active ? 'ปิด' : 'เปิด'}ใช้งานคุณ ${user.name}?`)) return;
        try {
            await userApi.toggleActive(user.user_id, !user.is_active);
            fetchUsers();
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
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
            <Container maxWidth="xl">
                <Fade in timeout={600}>
                    <Box>
                        {/* Header */}
                        <Box sx={{ mb: 6 }}>
                            <Button
                                startIcon={<ArrowBack />}
                                onClick={() => navigate('/admin/dashboard')}
                                sx={{ mb: 2, fontWeight: 700, color: 'text.secondary' }}
                            >
                                กลับไปหน้า Dashboard
                            </Button>
                            <Grid container justifyContent="space-between" alignItems="center" spacing={3}>
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Typography variant="h3" sx={{ fontWeight: 950, color: 'primary.main', letterSpacing: -1 }}>
                                        User Management
                                    </Typography>
                                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, opacity: 0.7 }}>
                                        จัดการสิทธิ์และบัญชีผู้ใช้งานทั้งหมดในระบบ (Role Administration)
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
                                            px: 4, py: 1.5,
                                            fontWeight: 900,
                                            boxShadow: '0 8px 20px rgba(62, 39, 35, 0.2)',
                                        }}
                                    >
                                        เพิ่มผู้ใช้งานใหม่
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Stat Cards */}
                        <Grid container spacing={3} sx={{ mb: 6 }}>
                            {[
                                { label: 'บัญชีทั้งหมด', value: stats.total, icon: <Group />, color: '#3E2723' },
                                { label: 'แอดมิน (Admin)', value: stats.admins, icon: <Shield />, color: '#e11d48' },
                                { label: 'นักวิจัย (Researcher)', value: stats.researchers, icon: <Science />, color: '#3b82f6' },
                                { label: 'นวัตกร (Operator)', value: stats.operators, icon: <Engineering />, color: '#10b981' },
                            ].map((s, idx) => (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                                    <Paper sx={{ p: 3, borderRadius: 5, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                        <Avatar sx={{ bgcolor: `${s.color}15`, color: s.color, width: 56, height: 56, borderRadius: 4 }}>
                                            {s.icon}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>{s.label}</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 900 }}>{s.value}</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Table Section */}
                        <Paper sx={{ borderRadius: 6, overflow: 'hidden' }}>
                            <Box sx={{ p: 3, bgcolor: '#fdfbf7', borderBottom: '1px solid #efebe9' }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <TextField
                                            fullWidth size="small"
                                            placeholder="Search name or phone..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            InputProps={{
                                                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                                                sx: { borderRadius: 3, bgcolor: 'white' }
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 2.5 }}>
                                        <TextField
                                            select fullWidth size="small"
                                            value={filterRole}
                                            onChange={e => setFilterRole(e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}
                                        >
                                            <MenuItem value="all">All Roles</MenuItem>
                                            <MenuItem value="admin">Admin</MenuItem>
                                            <MenuItem value="researcher">Researcher</MenuItem>
                                            <MenuItem value="operator">Operator</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 2.5 }}>
                                        <TextField
                                            select fullWidth size="small"
                                            value={filterStatus}
                                            onChange={e => setFilterStatus(e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}
                                        >
                                            <MenuItem value="all">All Status</MenuItem>
                                            <MenuItem value="active">Active</MenuItem>
                                            <MenuItem value="disabled">Disabled</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: 'right' }}>
                                        <Button onClick={() => { setSearch(''); setFilterRole('all'); setFilterStatus('all'); }}>Clear</Button>
                                    </Grid>
                                </Grid>
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#fafafa' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 900, py: 2.5 }}>Name</TableCell>
                                            <TableCell sx={{ fontWeight: 900 }}>Role</TableCell>
                                            <TableCell sx={{ fontWeight: 900 }}>Phone</TableCell>
                                            <TableCell sx={{ fontWeight: 900 }}>Registered Date</TableCell>
                                            <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 900, pr: 4 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                                        ) : filteredUsers.map((u) => (
                                            <TableRow key={u.user_id} hover>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar sx={{
                                                            bgcolor: u.role === 'admin' ? '#e11d48' : u.role === 'researcher' ? 'primary.main' : 'secondary.main',
                                                            borderRadius: 3
                                                        }}>
                                                            {u.role === 'admin' ? <Shield /> : u.role === 'researcher' ? <Science /> : <Engineering />}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 700 }}>{u.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">ID: {u.user_id}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={u.role.toUpperCase()}
                                                        size="small"
                                                        sx={{ fontWeight: 900, borderRadius: 1.5 }}
                                                        color={u.role === 'admin' ? 'error' : u.role === 'researcher' ? 'primary' : 'secondary'}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>{u.phone}</TableCell>
                                                <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                                                    {u.created_at ? new Date(u.created_at).toLocaleDateString('th-TH', {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    }) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={u.is_active ? <ToggleOn /> : <ToggleOff />}
                                                        label={u.is_active ? "Active" : "Disabled"}
                                                        onClick={() => toggleStatus(u)}
                                                        sx={{
                                                            fontWeight: 800,
                                                            cursor: 'pointer',
                                                            bgcolor: u.is_active ? '#ecfdf5' : '#fef2f2',
                                                            color: u.is_active ? '#059669' : '#dc2626',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ pr: 4 }}>
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Tooltip title="รีเซ็ตรหัสผ่าน">
                                                            <IconButton size="small" onClick={() => { setResettingUser(u); setShowResetModal(true); }}>
                                                                <LockReset color="warning" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <IconButton size="small" onClick={() => {
                                                            setEditingUser(u);
                                                            setFormData({ name: u.name, phone: u.phone, role: u.role, password: '' });
                                                            setShowModal(true);
                                                        }}>
                                                            <Edit color="primary" />
                                                        </IconButton>
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

            {/* Modal Form */}
            <Dialog open={showModal} onClose={closeModal} fullWidth maxWidth="xs">
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogTitle sx={{ fontWeight: 900 }}>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField label="ชื่อ-นามสกุล" fullWidth required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <TextField label="เบอร์โทรศัพท์" fullWidth required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            {!editingUser && (
                                <TextField
                                    label="รหัสผ่าน" type={showPassword ? 'text' : 'password'} fullWidth required
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                            <TextField select label="บทบาท" fullWidth value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                <MenuItem value="admin">Administrator</MenuItem>
                                <MenuItem value="researcher">Researcher</MenuItem>
                                <MenuItem value="operator">Operator</MenuItem>
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={closeModal}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* Reset PW Modal */}
            <Dialog open={showResetModal} onClose={closeResetModal} fullWidth maxWidth="xs">
                <Box component="form" onSubmit={handleResetPassword}>
                    <DialogTitle sx={{ fontWeight: 900 }}>Reset Password: {resettingUser?.name}</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="รหัสผ่านใหม่" fullWidth required sx={{ mt: 1 }}
                            value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={closeResetModal}>Cancel</Button>
                        <Button type="submit" variant="contained" color="warning">Confirm Reset</Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}
