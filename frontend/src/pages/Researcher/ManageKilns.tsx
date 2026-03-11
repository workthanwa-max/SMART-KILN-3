import { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Grid, Button,
    Stack, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, CircularProgress,
    Fade, Avatar, Tooltip, Paper, MenuItem
} from '@mui/material';
import {
    LocalFireDepartment,
    Add,
    Edit,
    Place,
    PowerSettingsNew,
    Search,
    AssignmentTurnedIn,
    ReportProblem,
    Factory,
    Science
} from '@mui/icons-material';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { syncService } from '../../services/syncService';
import Sidebar from '../../components/Sidebar';

const drawerWidth = 280;

export default function ManageKilns() {
    const kilns = useLiveQuery(() => db.kilns.toArray()) || [];
    const [loading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingKiln, setEditingKiln] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', location: '', note: '', latitude: '', longitude: '' });
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [mapLink, setMapLink] = useState('');

    useEffect(() => {
        syncService.pullFromServer();
        syncService.syncPendingChanges();
    }, []);

    const stats = {
        total: kilns.length,
        active: kilns.filter(k => k.is_active).length,
        maintenance: kilns.filter(k => !k.is_active).length
    };

    const filteredKilns = kilns.filter(k => {
        const matchesSearch = k.name.toLowerCase().includes(search.toLowerCase()) ||
            (k.location && k.location.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' ? k.is_active : !k.is_active);
        return matchesSearch && matchesStatus;
    });

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("เบราว์เซอร์ของคุณไม่รองรับการดึงตำแหน่ง");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude.toString(),
                    longitude: pos.coords.longitude.toString()
                }));
            },
            (err) => alert("ไม่สามารถดึงตำแหน่งได้: " + err.message)
        );
    };

    const confirmParseMapLink = () => {
        let lat: string | null = null;
        let lng: string | null = null;

        // 1. Try !3d...!4d... (High precision data param, common in "Copy Link")
        // Example: ...!3d13.1234567!4d100.1234567...
        const dataMatch = mapLink.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (dataMatch) {
            lat = dataMatch[1];
            lng = dataMatch[2];
        }

        // 2. Try q=lat,lng (Query param)
        // Example: ?q=13.123,100.123
        if (!lat) {
            const qMatch = mapLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (qMatch) {
                lat = qMatch[1];
                lng = qMatch[2];
            }
        }

        // 3. Try ll=lat,lng (LatLong param)
        // Example: ?ll=13.123,100.123
        if (!lat) {
            const llMatch = mapLink.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (llMatch) {
                lat = llMatch[1];
                lng = llMatch[2];
            }
        }

        // 4. Try search path
        // Example: /maps/search/13.123,100.123
        if (!lat) {
            const searchMatch = mapLink.match(/\/search\/(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (searchMatch) {
                lat = searchMatch[1];
                lng = searchMatch[2];
            }
        }

        // 5. Try viewport @lat,lng (Fallback, least precise but better than nothing)
        // Example: @13.123,100.123
        if (!lat) {
            const viewportMatch = mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (viewportMatch) {
                lat = viewportMatch[1];
                lng = viewportMatch[2];
            }
        }

        if (lat && lng) {
            setFormData(prev => ({
                ...prev,
                latitude: lat!,
                longitude: lng!
            }));
            alert(`ดึงพิกัดสำเร็จ: ${lat}, ${lng}`);
        } else {
            alert("ไม่พบพิกัดในลิงก์ที่ระบุ โปรดตรวจสอบว่าเป็นลิงก์ Google Maps ที่ถูกต้อง");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                latitude: formData.latitude ? formData.latitude : undefined,
                longitude: formData.longitude ? formData.longitude : undefined,
                is_active: editingKiln ? editingKiln.is_active : 1,
                sync_status: (editingKiln ? 'pending_update' : 'pending_create') as any
            };
            if (editingKiln) {
                await db.kilns.update(editingKiln.kiln_id, payload);
            } else {
                await db.kilns.add(payload as any);
            }
            closeModal();
            syncService.syncPendingChanges();
        } catch (err) { alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลลงเครื่อง"); }
    };

    const toggleStatus = async (kiln: any) => {
        if (!window.confirm(`ยืนยันการ${kiln.is_active ? 'ปิด' : 'เปิด'}ใช้งานเตา ${kiln.name}?`)) return;
        try {
            await db.kilns.update(kiln.kiln_id, {
                is_active: kiln.is_active === 1 ? 0 : 1,
                sync_status: 'pending_update'
            });
            syncService.syncPendingChanges();
        } catch (err) { console.error(err); }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingKiln(null);
        setFormData({ name: '', location: '', note: '', latitude: '', longitude: '' });
        setMapLink('');
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
            <Sidebar />

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Container maxWidth="xl">
                    <Fade in timeout={600}>
                        <Box>
                            {/* Header */}
                            <Box sx={{ mb: 6 }}>
                                <Grid container justifyContent="space-between" alignItems="center" spacing={3}>
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Typography variant="h3" sx={{ fontWeight: 950, color: 'primary.main', letterSpacing: -1 }}>
                                            🔥 จัดการเตาเผา
                                        </Typography>
                                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, mt: 0.5, opacity: 0.8 }}>
                                            ควบคุมดูแลสถานะ และบริหารจัดการเตาเผาถ่านทั้งหมดในโครงการ
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
                                        <Button
                                            variant="contained" size="large"
                                            startIcon={<Add />}
                                            onClick={() => setShowModal(true)}
                                            sx={{
                                                borderRadius: 5, px: 4, py: 2,
                                                fontWeight: 900, fontSize: '1.1rem',
                                                boxShadow: '0 8px 24px -6px rgba(62, 39, 35, 0.3)',
                                                textTransform: 'none'
                                            }}
                                        >
                                            เพิ่มเตาเผาใหม่
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Stat Summary */}
                            <Grid container spacing={3} sx={{ mb: 6 }}>
                                {[
                                    { label: 'เตาเผาทั้งหมด', value: stats.total, icon: <Factory />, color: 'primary.main' },
                                    { label: 'พร้อมใช้งาน (Active)', value: stats.active, icon: <AssignmentTurnedIn />, color: 'secondary.main' },
                                    { label: 'ปิดปรับปรุง/ระงับ', value: stats.maintenance, icon: <ReportProblem />, color: 'error.main' },
                                ].map((s, idx) => (
                                    <Grid size={{ xs: 12, md: 4 }} key={idx}>
                                        <Paper sx={{
                                            p: 3, borderRadius: 6, border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                            display: 'flex', alignItems: 'center', gap: 2.5
                                        }}>
                                            <Avatar sx={{
                                                bgcolor: 'white', color: s.color,
                                                width: 60, height: 60, borderRadius: 4,
                                                border: '1px solid', borderColor: 'divider',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                                            }}>
                                                {s.icon}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'uppercase', opacity: 0.7 }}>
                                                    {s.label}
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 950, color: 'primary.main' }}>
                                                    {s.value} <span style={{ fontSize: '1rem', color: 'text.secondary', fontWeight: 700 }}>เตา</span>
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Filter Section */}
                            <Paper sx={{ p: 2, borderRadius: 5, mb: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            fullWidth size="small"
                                            placeholder="ค้นหาชื่อเตาหรือสถานที่ตั้ง..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            InputProps={{
                                                startAdornment: <Search sx={{ mr: 1, color: '#94a3b8' }} />,
                                                sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <TextField
                                            select fullWidth size="small"
                                            value={filterStatus}
                                            onChange={e => setFilterStatus(e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' } }}
                                        >
                                            <MenuItem value="all">สถานะทั้งหมด</MenuItem>
                                            <MenuItem value="active">Active (พร้อมใช้งาน)</MenuItem>
                                            <MenuItem value="disabled">Maintenance (ระงับ)</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {loading ? (
                                <Box sx={{ textAlign: 'center', py: 10 }}>
                                    <CircularProgress thickness={5} size={50} />
                                    <Typography sx={{ mt: 2, fontWeight: 700, color: 'text.secondary' }}>กำลังรวบรวมข้อมูลเตาเผา...</Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    {filteredKilns.length === 0 ? (
                                        <Grid size={{ xs: 12 }}>
                                            <Paper sx={{
                                                py: 12, textAlign: 'center', borderRadius: 8,
                                                border: '2px dashed #e2e8f0', bgcolor: 'transparent'
                                            }}>
                                                <Science sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
                                                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 800 }}>ไม่พบข้อมูลเตาเผา</Typography>
                                                <Typography color="text.secondary">ลองเปลี่ยนเงื่อนไขการค้นหาของคุณ</Typography>
                                            </Paper>
                                        </Grid>
                                    ) : (
                                        filteredKilns.map((k) => (
                                            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={k.kiln_id}>
                                                <Paper sx={{
                                                    p: 0, borderRadius: 6, overflow: 'hidden',
                                                    border: '1px solid #e2e8f0', transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-8px)',
                                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                                        borderColor: k.is_active ? 'primary.main' : 'error.main'
                                                    }
                                                }}>
                                                    <Box sx={{ p: 4 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                                            <Avatar sx={{
                                                                bgcolor: k.is_active ? 'primary.main' : 'error.main',
                                                                color: '#fff',
                                                                width: 56, height: 56, borderRadius: 4,
                                                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                                            }}>
                                                                <LocalFireDepartment />
                                                            </Avatar>
                                                            <Chip
                                                                label={k.is_active ? "READY" : "OFFLINE"}
                                                                sx={{
                                                                    fontWeight: 900, borderRadius: 1.5,
                                                                    bgcolor: k.is_active ? 'secondary.main' : 'error.main',
                                                                    color: '#fff', fontSize: '0.7rem'
                                                                }}
                                                            />
                                                        </Box>

                                                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: 'primary.main' }}>
                                                            {k.name}
                                                        </Typography>

                                                        <Stack spacing={2} sx={{ mt: 3 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#f1f5f9', color: '#64748b' }}>
                                                                    <Place sx={{ fontSize: 18 }} />
                                                                </Avatar>
                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                                                                    {k.location || 'ไม่ระบุพิกัดเตา'}
                                                                </Typography>
                                                                {k.latitude && k.longitude && (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                                                                        <Tooltip title="ดูบน Google Maps">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${k.latitude},${k.longitude}`, '_blank')}
                                                                                sx={{ p: 0, color: 'primary.main' }}
                                                                            >
                                                                                <Place sx={{ fontSize: 20 }} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                                            ({k.latitude}, {k.longitude})
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary" sx={{
                                                                lineHeight: 1.6, display: '-webkit-box',
                                                                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden', fontStyle: 'italic', pl: 1
                                                            }}>
                                                                "{k.note || 'ไม่มีรายละเอียดเพิ่มเติมระบุไว้ในระบบ'}"
                                                            </Typography>
                                                        </Stack>
                                                    </Box>

                                                    <Box sx={{
                                                        px: 3, py: 2, bgcolor: '#f8fafc',
                                                        borderTop: '1px solid #f1f5f9',
                                                        display: 'flex', justifyContent: 'flex-end', gap: 1
                                                    }}>
                                                        <Tooltip title="แก้ไขข้อมูล">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setEditingKiln(k);
                                                                    setFormData({
                                                                        name: k.name,
                                                                        location: k.location,
                                                                        note: k.note,
                                                                        latitude: k.latitude?.toString() || '',
                                                                        longitude: k.longitude?.toString() || ''
                                                                    });
                                                                    setShowModal(true);
                                                                }}
                                                                sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', '&:hover': { bgcolor: 'primary.main', color: '#fff' } }}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={k.is_active ? "ระงับการใช้งาน" : "เปิดใช้งาน"}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => toggleStatus(k)}
                                                                sx={{
                                                                    bgcolor: k.is_active ? '#fef2f2' : '#f0fdf4',
                                                                    color: k.is_active ? '#dc2626' : '#16a34a',
                                                                    border: '1px solid', borderColor: 'divider',
                                                                    '&:hover': {
                                                                        bgcolor: k.is_active ? '#dc2626' : '#16a34a',
                                                                        color: '#fff'
                                                                    }
                                                                }}
                                                            >
                                                                <PowerSettingsNew fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))
                                    )}
                                </Grid>
                            )}
                        </Box>
                    </Fade>
                </Container>
            </Box>

            {/* Modal */}
            <Dialog
                open={showModal} onClose={closeModal}
                fullWidth maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 6, p: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } }}
            >
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', pt: 4, px: 3, fontSize: '1.6rem' }}>
                        {editingKiln ? '📝 แก้ไขข้อมูลเตา' : '🔥 เพิ่มเตาเผาใหม่'}
                    </DialogTitle>
                    <DialogContent sx={{ px: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
                            ระบุรายละเอียดพิกัดและคุณลักษณะของเตา เพื่อใช้ในการวิจัยและบันทึกผล
                        </Typography>
                        <Stack spacing={3}>
                            <TextField
                                label="ชื่อเรียกเตาเผา" fullWidth required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                InputProps={{ sx: { borderRadius: 4, fontWeight: 700 } }}
                            />
                            <TextField
                                label="สถานที่ตั้ง (Location)" fullWidth
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                InputProps={{ sx: { borderRadius: 4, fontWeight: 700 } }}
                            />
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                <TextField
                                    label="วางลิงก์จาก Google Maps" fullWidth
                                    placeholder="https://www.google.com/maps/..."
                                    value={mapLink}
                                    onChange={e => setMapLink(e.target.value)}
                                    InputProps={{ sx: { borderRadius: 4 } }}
                                    helperText="วางลิงก์แล้วกดยืนยันเพื่อดึงพิกัด"
                                />
                                <Button
                                    variant="outlined"
                                    onClick={confirmParseMapLink}
                                    sx={{ px: 2, py: 1.85, borderRadius: 4, fontWeight: 700, flexShrink: 0 }}
                                >
                                    ยืนยัน
                                </Button>
                            </Stack>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        label="Latitude" fullWidth
                                        value={formData.latitude}
                                        onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                        InputProps={{ sx: { borderRadius: 4, fontWeight: 700 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        label="Longitude" fullWidth
                                        value={formData.longitude}
                                        onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                        InputProps={{ sx: { borderRadius: 4, fontWeight: 700 } }}
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                label="รายละเอียด / ข้อมูลทางเทคนิค"
                                fullWidth multiline rows={4}
                                value={formData.note}
                                onChange={e => setFormData({ ...formData, note: e.target.value })}
                                InputProps={{ sx: { borderRadius: 4, fontWeight: 700 } }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 4 }}>
                        <Button onClick={closeModal} variant="text" sx={{ fontWeight: 700, color: 'text.secondary' }}>ยกเลิก</Button>
                        <Button type="submit" variant="contained" size="large" sx={{ borderRadius: 4, px: 5, fontWeight: 800 }}>
                            บันทึกข้อมูลเตา
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}
