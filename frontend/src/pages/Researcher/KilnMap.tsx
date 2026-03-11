import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Avatar, Grid, Container, CircularProgress } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { Place, LocalFireDepartment, Factory, ReportProblem } from '@mui/icons-material';
import L from 'leaflet';
import Sidebar from '../../components/Sidebar';

// Fix Leaflet default icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const drawerWidth = 280;

// Custom Icons for different statuses
const createCustomIcon = (color: string) => {
    return new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
};

const icons = {
    ready: createCustomIcon('#10b981'), // Green
    burning: createCustomIcon('#f97316'), // Orange
    disabled: createCustomIcon('#ef4444') // Red
};

// Recenter map component to handle updates
function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function KilnMap() {
    const kilns = useLiveQuery(() => db.kilns.toArray()) || [];
    const experiments = useLiveQuery(() => db.experiments.toArray()) || [];
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate initial loading slightly to ensure DB is ready or just better UX
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const getKilnStatus = (kiln: any) => {
        if (!kiln.is_active) return 'disabled';

        // Check for active burning experiment
        // Logic: active experiment has no final_moisture (not finished) OR end time not reached (simplified for now as "has experiment")
        // Better logic from previous: created_at + burn_hours > now. 
        // For offline-first simplified: If there is an experiment for this kiln that doesn't have a 'final_moisture' or 'end_date' (if we had it), assume burning.
        // Actually, let's use the exact logic: checks for "Burning" status usually imply an open experiment.
        // In our experiments table, we don't have an explicit 'status' column, but we have 'final_moisture' which is usually filled at end.
        // Let's assume: if there is an experiment for this kiln in the last 24-48 hours that doesn't have 'final_moisture' set to 'แห้งสนิท', it's burning.

        // However, specifically looking at the schema: 
        // We can just check if there's ANY experiment for this kiln that doesn't have `final_moisture` set.
        const activeExp = experiments.find(e =>
            e.kiln_id === kiln.kiln_id &&
            (!e.final_moisture || e.final_moisture === '0') // Not finished
        );

        if (activeExp) return 'burning';
        return 'ready';
    };

    // Center map calculation
    // Logic to find the "densest" area => Median is robust for this
    const validKilns = kilns.filter(k => k.latitude && k.longitude && !isNaN(parseFloat(k.latitude)) && !isNaN(parseFloat(k.longitude)));

    const getMedian = (values: number[]) => {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const lats = validKilns.map(k => parseFloat(k.latitude!));
    const lngs = validKilns.map(k => parseFloat(k.longitude!));

    const centerLat = validKilns.length > 0 ? getMedian(lats) : 13.7563;
    const centerLng = validKilns.length > 0 ? getMedian(lngs) : 100.5018;

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh', width: '100%' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Container maxWidth="xl" sx={{ height: '85vh', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h3" sx={{ fontWeight: 950, color: '#0f172a', letterSpacing: -1 }}>
                            🗺️ แผนที่เตาเผา
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5, opacity: 0.8 }}>
                            แสดงตำแหน่งและสถานะการทำงานของเตาเผาทั้งหมดในรูปแบบแผนที่
                        </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid>
                            <Chip icon={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981', ml: 1 }} />} label="พร้อมใช้งาน (Ready)" variant="outlined" sx={{ fontWeight: 700, borderColor: '#10b981', color: '#065f46' }} />
                        </Grid>
                        <Grid>
                            <Chip icon={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f97316', ml: 1 }} />} label="กำลังเผา (Burning)" variant="outlined" sx={{ fontWeight: 700, borderColor: '#f97316', color: '#9a3412' }} />
                        </Grid>
                        <Grid>
                            <Chip icon={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444', ml: 1 }} />} label="ปิดใช้งาน (Disabled)" variant="outlined" sx={{ fontWeight: 700, borderColor: '#ef4444', color: '#991b1b' }} />
                        </Grid>
                    </Grid>

                    <Paper sx={{ flexGrow: 1, borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
                                <CircularProgress thickness={5} size={50} />
                                <Typography sx={{ mt: 2, fontWeight: 700, color: 'text.secondary' }}>กำลังโหลดแผนที่...</Typography>
                            </Box>
                        ) : (
                            <MapContainer
                                center={[centerLat, centerLng]}
                                zoom={validKilns.length > 0 ? 10 : 6}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <RecenterMap center={[centerLat, centerLng]} zoom={validKilns.length > 0 ? 10 : 6} />
                                <LayersControl position="topright">
                                    <LayersControl.BaseLayer checked name="แผนที่ทั่วไป (Standard)">
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                    </LayersControl.BaseLayer>

                                    <LayersControl.BaseLayer name="แผนที่ดาวเทียม (Satellite)">
                                        <TileLayer
                                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                        />
                                    </LayersControl.BaseLayer>

                                    <LayersControl.BaseLayer name="แผนที่ภูมิประเทศ (Terrain)">
                                        <TileLayer
                                            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                                        />
                                    </LayersControl.BaseLayer>
                                </LayersControl>
                                {validKilns.map(k => {
                                    const status = getKilnStatus(k);
                                    return (
                                        <Marker
                                            key={k.kiln_id}
                                            position={[parseFloat(k.latitude!), parseFloat(k.longitude!)]}
                                            icon={icons[status as keyof typeof icons]}
                                        >
                                            <Popup>
                                                <Box sx={{ minWidth: 200 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: status === 'ready' ? '#10b981' : status === 'burning' ? '#f97316' : '#ef4444' }}>
                                                            {status === 'burning' ? <LocalFireDepartment sx={{ fontSize: 18 }} /> : (status === 'ready' ? <Factory sx={{ fontSize: 18 }} /> : <ReportProblem sx={{ fontSize: 18 }} />)}
                                                        </Avatar>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>{k.name}</Typography>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <Place sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>{k.location}</Typography>
                                                    </Box>

                                                    {k.note && (
                                                        <Typography variant="caption" sx={{ display: 'block', mt: 1, p: 1, bgcolor: '#f1f5f9', borderRadius: 1, color: '#475569', fontStyle: 'italic' }}>
                                                            "{k.note}"
                                                        </Typography>
                                                    )}

                                                    <Chip
                                                        label={status.toUpperCase()}
                                                        size="small"
                                                        sx={{
                                                            mt: 1.5, width: '100%', fontWeight: 800,
                                                            bgcolor: status === 'ready' ? '#d1fae5' : status === 'burning' ? '#ffedd5' : '#fee2e2',
                                                            color: status === 'ready' ? '#065f46' : status === 'burning' ? '#9a3412' : '#991b1b'
                                                        }}
                                                    />
                                                </Box>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        )}
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
}
