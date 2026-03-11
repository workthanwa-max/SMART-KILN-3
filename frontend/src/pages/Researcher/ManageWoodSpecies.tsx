import { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Button,
    IconButton, Switch, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Stack, CircularProgress,
    Alert, Fade, Chip, InputAdornment
} from '@mui/material';
import { Edit, Delete, Add, Search, Forest } from '@mui/icons-material';
import { woodSpeciesApi } from '../../api';
import Sidebar from '../../components/Sidebar';

const drawerWidth = 280;

export default function ManageWoodSpecies() {
    const [species, setSpecies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    // Dialog State
    const [open, setOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [name, setName] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchSpecies = async () => {
        try {
            setLoading(true);
            const res = await woodSpeciesApi.getAll();
            setSpecies(res.data);
        } catch (err) {
            console.error(err);
            setError('ไม่สามารถดึงข้อมูลพันธุ์ไม้ได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpecies();
    }, []);

    const handleOpen = (item: any = null) => {
        setEditingItem(item);
        setName(item ? item.name : '');
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setError('');
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setSubmitLoading(true);
        try {
            if (editingItem) {
                await woodSpeciesApi.update(editingItem.species_id, name);
            } else {
                await woodSpeciesApi.create(name);
            }
            handleClose();
            fetchSpecies();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'ดำเนินการไม่สำเร็จ');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleToggleActive = async (id: number, currentActive: number) => {
        try {
            await woodSpeciesApi.toggleActive(id, currentActive === 0);
            fetchSpecies();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('ยืนยันการลบพันธุ์ไม้?')) return;
        try {
            await woodSpeciesApi.delete(id);
            fetchSpecies();
        } catch (err: any) {
            alert(err.response?.data?.message || err.message || 'ไม่สามารถลบได้');
        }
    };

    const filteredSpecies = species.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
            <Sidebar />

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Container maxWidth="lg">
                    <Fade in timeout={800}>
                        <Box>
                            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 950, color: 'primary.main', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Forest sx={{ fontSize: 40, color: 'secondary.main' }} />
                                        จัดการพันธุ์ไม้
                                    </Typography>
                                    <Typography color="primary.main" sx={{ fontWeight: 700, opacity: 0.8 }}>
                                        กำหนดรายการพันธุ์ไม้สำหรับการวิจัยและเผาถ่าน
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => handleOpen()}
                                    sx={{ borderRadius: 4, px: 4, py: 1.5, fontWeight: 900, boxShadow: '0 8px 16px -4px rgba(62, 39, 35, 0.2)' }}
                                >
                                    เพิ่มพันธุ์ไม้
                                </Button>
                            </Box>

                            <Paper sx={{ borderRadius: 6, border: '1px solid #EFEBE9', overflow: 'hidden', mb: 4, boxShadow: '0 10px 20px -5px rgba(62, 39, 35, 0.05)' }}>
                                <Box sx={{ p: 3, borderBottom: '1px solid #EFEBE9', bgcolor: 'white' }}>
                                    <TextField
                                        fullWidth
                                        placeholder="ค้นหาชื่อพันธุ์ไม้..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Search sx={{ color: 'secondary.main' }} /></InputAdornment>,
                                            sx: { borderRadius: 4, bgcolor: 'background.default' }
                                        }}
                                    />
                                </Box>

                                <TableContainer>
                                    <Table>
                                        <TableHead sx={{ bgcolor: 'background.default' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 900, color: 'primary.main', py: 2.5 }}>ชื่อพันธุ์ไม้</TableCell>
                                                <TableCell sx={{ fontWeight: 900, color: 'primary.main' }}>สถานะ</TableCell>
                                                <TableCell sx={{ fontWeight: 900, color: 'primary.main' }}>วันที่เพิ่ม</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 900, color: 'primary.main', pr: 4 }}>จัดการ</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                                        <CircularProgress size={30} />
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredSpecies.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                                        <Typography color="text.secondary">ไม่พบข้อมูล</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredSpecies.map((item) => (
                                                <TableRow key={item.species_id} hover sx={{ '&:hover': { bgcolor: 'background.default' } }}>
                                                    <TableCell sx={{ fontWeight: 800, color: 'primary.main', py: 2.5 }}>{item.name}</TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Switch
                                                                checked={item.is_active === 1}
                                                                onChange={() => handleToggleActive(item.species_id, item.is_active)}
                                                            />
                                                            <Chip
                                                                label={item.is_active === 1 ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                                size="small"
                                                                color={item.is_active === 1 ? 'secondary' : 'default'}
                                                                sx={{ fontWeight: 900, height: 28, borderRadius: 1.5 }}
                                                            />
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                                        {new Date(item.created_at).toLocaleDateString('th-TH')}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ pr: 3 }}>
                                                        <IconButton onClick={() => handleOpen(item)} color="secondary" sx={{ bgcolor: 'rgba(46, 125, 50, 0.08)', mr: 1, borderRadius: 2 }}>
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleDelete(item.species_id)} color="error" sx={{ bgcolor: '#fef2f2', borderRadius: 2 }}>
                                                            <Delete fontSize="small" />
                                                        </IconButton>
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

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 6, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 900, pt: 3, color: 'primary.main' }}>
                    {editingItem ? '📝 แก้ไขพันธุ์ไม้' : '🌳 เพิ่มพันธุ์ไม้ใหม่'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                        <TextField
                            fullWidth
                            label="ชื่อพันธุ์ไม้"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                            autoFocus
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 1 }}>
                    <Button onClick={handleClose} sx={{ fontWeight: 800, color: 'text.secondary' }}>ยกเลิก</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={submitLoading || !name.trim()}
                        sx={{ borderRadius: 4, px: 4, py: 1.2, fontWeight: 900 }}
                    >
                        {submitLoading ? <CircularProgress size={24} color="inherit" /> : 'บันทึกข้อมูล'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
