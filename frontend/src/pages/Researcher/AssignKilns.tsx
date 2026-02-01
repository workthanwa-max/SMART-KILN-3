import { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Grid, Paper, Button,
    Stack, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Divider, Avatar, TextField,
    InputAdornment, Fade, CircularProgress,
    MenuItem, IconButton, Chip, Tooltip, Zoom
} from '@mui/material';
import {
    ArrowForward,
    DeleteOutline,
    AddCircle,
    LocalFireDepartment,
    Search,
    Badge,
    AssignmentInd,
    Groups,
    SensorsOff,
    Handyman
} from '@mui/icons-material';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { syncService } from '../../services/syncService';
import Sidebar from '../../components/Sidebar';

const drawerWidth = 280;

export default function AssignKilns() {
    const operators = useLiveQuery(() => db.users.where('role').equals('operator').and(u => u.is_active === 1).toArray()) || [];
    const kilns = useLiveQuery(() => db.kilns.where('is_active').equals(1).toArray()) || [];
    const [selectedOp, setSelectedOp] = useState<any>(null);

    const myKilnAssignments = useLiveQuery(() =>
        selectedOp ? db.user_kilns.where('user_id').equals(selectedOp.user_id).and(uk => uk.sync_status !== 'pending_delete').toArray() : []
        , [selectedOp]) || [];

    const myKilns = useLiveQuery(async () => {
        if (!myKilnAssignments.length) return [];
        const kilnIds = myKilnAssignments.map(uk => uk.kiln_id);
        return db.kilns.where('kiln_id').anyOf(kilnIds).toArray();
    }, [myKilnAssignments]) || [];

    const [loading] = useState(false);
    const [targetKilnId, setTargetKilnId] = useState('');
    const [searchOp, setSearchOp] = useState('');

    useEffect(() => {
        // Initial sync pulls
        syncService.pullFromServer();
        syncService.syncPendingChanges();
    }, []);

    const fetchUserKilns = async (op: any) => {
        setSelectedOp(op);
        // We might want to pull assignments for this specific user if we don't have them all
        // But for now, we assume pullFromServer handles it if we added an endpoint
        // Since we don't have a specific 'pull assignments' yet, we'll just use what's local
    };

    const handleAddKiln = async () => {
        if (!targetKilnId || !selectedOp) return;
        try {
            await db.user_kilns.add({
                user_id: selectedOp.user_id as number,
                kiln_id: Number(targetKilnId),
                sync_status: 'pending_create'
            });
            setTargetKilnId('');
            syncService.syncPendingChanges();
        } catch (err) { alert("เกิดข้อผิดพลาดในการมอบหมายเตาลงเครื่อง"); }
    };

    const handleRemoveKiln = async (kilnId: number) => {
        if (!selectedOp) return;
        if (!window.confirm("ยืนยันการยกเลิกการมอบหมายเตานี้?")) return;
        try {
            const assignment = await db.user_kilns.where({ user_id: selectedOp.user_id, kiln_id: kilnId }).first();
            if (assignment) {
                if (assignment.sync_status === 'pending_create') {
                    await db.user_kilns.delete(assignment.id!);
                } else {
                    await db.user_kilns.update(assignment.id!, { sync_status: 'pending_delete' });
                }
                syncService.syncPendingChanges();
            }
        } catch (err) { console.error(err); }
    };

    const filteredOperators = operators.filter(op =>
        op.name.toLowerCase().includes(searchOp.toLowerCase()) ||
        op.phone.includes(searchOp) // Using phone instead of uid if uid is missing
    );

    const stats = {
        totalOps: operators.length,
        totalAssigned: 0,
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
                                            🔗 การมอบหมายงาน
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5, opacity: 0.8 }}>
                                            บริหารจัดการความรับผิดชอบ และจับคู่พนักงานกับเตาเผาในระบบ
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
                                        <Paper sx={{
                                            p: 2, borderRadius: 4, bgcolor: '#fff', border: '1px solid #e2e8f0',
                                            display: 'inline-flex', alignItems: 'center', gap: 2, boxShadow: 'none'
                                        }}>
                                            <Avatar sx={{ bgcolor: '#eff6ff', color: 'primary.main', width: 44, height: 44 }}>
                                                <AssignmentInd />
                                            </Avatar>
                                            <Box sx={{ textAlign: 'left' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', display: 'block' }}>
                                                    พนักงานทั้งหมด
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1 }}>
                                                    {stats.totalOps} คน
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Grid container spacing={4}>
                                {/* Left Pane: Operator List */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper sx={{
                                        borderRadius: 6,
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                        overflow: 'hidden',
                                        bgcolor: '#fff',
                                        height: 'calc(100vh - 280px)',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Groups sx={{ color: 'primary.main' }} /> รายชื่อพนักงาน
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="ค้นหาชื่อ หรือ UID..."
                                                value={searchOp}
                                                onChange={e => setSearchOp(e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Search sx={{ color: '#94a3b8', fontSize: 20 }} />
                                                        </InputAdornment>
                                                    ),
                                                    sx: { borderRadius: 3, bgcolor: '#fff', fontWeight: 600 }
                                                }}
                                            />
                                        </Box>

                                        <List sx={{ py: 0, flexGrow: 1, overflow: 'auto' }}>
                                            {loading ? (
                                                <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={30} /></Box>
                                            ) : filteredOperators.length === 0 ? (
                                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary">ไม่พบข้อมูลพนักงาน</Typography>
                                                </Box>
                                            ) : (
                                                filteredOperators.map((op) => (
                                                    <ListItem key={op.user_id} disablePadding>
                                                        <ListItemButton
                                                            selected={selectedOp?.user_id === op.user_id}
                                                            onClick={() => fetchUserKilns(op)}
                                                            sx={{
                                                                py: 2.5, px: 3,
                                                                transition: 'all 0.2s',
                                                                borderLeft: '4px solid transparent',
                                                                '&.Mui-selected': {
                                                                    bgcolor: '#eff6ff',
                                                                    borderLeftColor: 'primary.main',
                                                                    '&:hover': { bgcolor: '#dbeafe' }
                                                                },
                                                                '&:hover': { bgcolor: '#f1f5f9' }
                                                            }}
                                                        >
                                                            <ListItemIcon>
                                                                <Avatar sx={{
                                                                    bgcolor: selectedOp?.user_id === op.user_id ? 'primary.main' : '#f1f5f9',
                                                                    color: selectedOp?.user_id === op.user_id ? '#fff' : '#64748b',
                                                                    width: 44, height: 44, fontWeight: 800,
                                                                    borderRadius: 2.5
                                                                }}>{op.name.charAt(0)}</Avatar>
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={op.name}
                                                                secondary={`Phone: ${op.phone}`}
                                                                primaryTypographyProps={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}
                                                                secondaryTypographyProps={{ fontWeight: 600, color: '#94a3b8' }}
                                                            />
                                                            {selectedOp?.user_id === op.user_id && <ArrowForward fontSize="small" color="primary" />}
                                                        </ListItemButton>
                                                        <Divider sx={{ opacity: 0.5 }} />
                                                    </ListItem>
                                                ))
                                            )}
                                        </List>
                                    </Paper>
                                </Grid>

                                {/* Right Pane: Details */}
                                <Grid size={{ xs: 12, md: 8 }}>
                                    {!selectedOp ? (
                                        <Paper sx={{
                                            p: 12, borderRadius: 6, border: '2px dashed #e2e8f0',
                                            textAlign: 'center', bgcolor: 'transparent',
                                            height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                        }}>
                                            <Zoom in timeout={800}>
                                                <Box>
                                                    <Box sx={{
                                                        width: 100, height: 100, borderRadius: '50%',
                                                        bgcolor: '#fff', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', margin: '0 auto 24px',
                                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                                    }}>
                                                        <Handyman sx={{ fontSize: 50, color: '#cbd5e1' }} />
                                                    </Box>
                                                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#64748b', mb: 1 }}>
                                                        ยังไม่มีการเลือกพนักงาน
                                                    </Typography>
                                                    <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                                        โปรดเลือกพนักงานจากรายการด้านซ้าย เพื่อจัดการการมอบหมายเตา
                                                    </Typography>
                                                </Box>
                                            </Zoom>
                                        </Paper>
                                    ) : (
                                        <Paper sx={{
                                            p: 4, borderRadius: 6, border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                            bgcolor: '#fff', minHeight: '100%'
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5 }}>
                                                <Box>
                                                    <Typography variant="h4" sx={{ fontWeight: 950, color: '#1e293b', mb: 1 }}>
                                                        จัดการเตา <Box component="span" sx={{ color: 'primary.main' }}>@{selectedOp.name}</Box>
                                                    </Typography>
                                                    <Chip
                                                        icon={<Badge sx={{ fontSize: '1rem !important' }} />}
                                                        label={`Phone: ${selectedOp.phone}`}
                                                        sx={{ fontWeight: 800, borderRadius: 2, bgcolor: '#f1f5f9' }}
                                                    />
                                                </Box>
                                                <Avatar sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.main', fontWeight: 900, borderRadius: 4 }}>
                                                    {selectedOp.name.charAt(0)}
                                                </Avatar>
                                            </Box>

                                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                🏢 เตาในความรับผิดชอบปัจจุบัน
                                                <Chip label={myKilns.length} size="small" sx={{ fontWeight: 900, bgcolor: 'primary.main', color: '#fff' }} />
                                            </Typography>

                                            <Stack spacing={2} sx={{ mb: 6 }}>
                                                {myKilns.length === 0 ? (
                                                    <Box sx={{
                                                        py: 8, textAlign: 'center', bgcolor: '#f8fafc',
                                                        borderRadius: 5, border: '1px dashed #e2e8f0'
                                                    }}>
                                                        <SensorsOff sx={{ fontSize: 40, color: '#cbd5e1', mb: 2 }} />
                                                        <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
                                                            ยังไม่ได้รับการมอบหมายเตาใดๆ ในขณะนี้
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    myKilns.map((k) => (
                                                        <Paper key={k.kiln_id} sx={{
                                                            p: 2.5, borderRadius: 4, display: 'flex',
                                                            alignItems: 'center', justifyContent: 'space-between',
                                                            border: '1px solid #f1f5f9', bgcolor: '#fcfcfd',
                                                            '&:hover': { bgcolor: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }
                                                        }}>
                                                            <Stack direction="row" alignItems="center" spacing={2.5}>
                                                                <Avatar sx={{
                                                                    bgcolor: '#fff', color: 'secondary.main',
                                                                    border: '1px solid #f1f5f9', width: 50, height: 50,
                                                                    borderRadius: 3
                                                                }}>
                                                                    <LocalFireDepartment />
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{k.name}</Typography>
                                                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>พิกัด: {k.location || 'ไม่ระบุพิกัด'}</Typography>
                                                                </Box>
                                                            </Stack>
                                                            <Tooltip title="ยกเลิกการมอบหมาย">
                                                                <IconButton
                                                                    color="error"
                                                                    onClick={() => handleRemoveKiln(k.kiln_id!)}
                                                                    sx={{ bgcolor: '#fef2f2', '&:hover': { bgcolor: 'error.main', color: '#fff' } }}
                                                                >
                                                                    <DeleteOutline />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Paper>
                                                    ))
                                                )}
                                            </Stack>

                                            <Box sx={{ p: 4, borderRadius: 5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 950, mb: 1, color: '#0f172a' }}>
                                                    ➕ มอบหมายเตาใหม่
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 3, fontWeight: 600, color: '#64748b' }}>
                                                    เลือกเตาเผาที่พร้อมใช้งานเพื่อมอบหมายให้พนักงานดูแลรับผิดชอบ
                                                </Typography>

                                                <Grid container spacing={2}>
                                                    <Grid size={{ xs: 12, sm: 8 }}>
                                                        <TextField
                                                            select
                                                            fullWidth
                                                            label="เลือกรายการเตาเผา"
                                                            value={targetKilnId}
                                                            onChange={e => setTargetKilnId(e.target.value)}
                                                            InputProps={{ sx: { borderRadius: 3, bgcolor: '#fff', fontWeight: 700 } }}
                                                        >
                                                            <MenuItem value=""><em>-- เลือกพิกัดเตา --</em></MenuItem>
                                                            {kilns.filter(ak => !myKilns.find(mk => mk.kiln_id === ak.kiln_id)).map(k => (
                                                                <MenuItem key={k.kiln_id} value={k.kiln_id!} sx={{ fontWeight: 600 }}>
                                                                    🔥 {k.name} - {k.location || 'ไม่ระบุพิกัด'}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 4 }}>
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            size="large"
                                                            startIcon={<AddCircle />}
                                                            onClick={handleAddKiln}
                                                            disabled={!targetKilnId}
                                                            sx={{
                                                                borderRadius: 3, height: '100%',
                                                                fontWeight: 900, fontSize: '1.05rem',
                                                                boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                                                            }}
                                                        >
                                                            เพิ่มงาน
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Paper>
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    </Fade>
                </Container>
            </Box>
        </Box>
    );
}