import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Middleware: แนบ Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Middleware: จัดการ Response และ Error
api.interceptors.response.use(
    (response) => {
        // [A2] Standardize Response Unwrapping: If it follows our status/data pattern, unwrap it
        if (response.data && response.data.status === 'success' && response.data.data !== undefined) {
            return { ...response, data: response.data.data };
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            window.location.href = '/login';
        } else if (error.response?.status === 429) {
            console.error("Rate limit reached. Please try again later.");
        } else if (!error.response) {
            console.error("Network Error: Backend may be down.", error);
        }

        // Normalize error message for easier frontend consumption
        if (error.response?.data?.status === 'error') {
            error.message = error.response.data.message || error.message;
        }

        return Promise.reject(error);
    }
);

export default api;

// --- ฟังก์ชันดึงข้อมูลแยกตามหมวดหมู่ ---

export const authApi = {
    login: (phone: string, password: string) => api.post('/auth/login', { phone, password }),
    changePassword: (newPassword: string) => api.post('/auth/change-password', { newPassword }),
    getMe: () => api.get('/auth/me'),
};

export const userApi = {
    getAll: () => api.get('/users'),
    create: (data: any) => api.post('/users', data),
    update: (id: number, data: any) => api.put(`/users/${id}`, data),
    toggleActive: (id: number, active: boolean) => api.patch(`/users/${id}/active`, { is_active: active }),
    resetPassword: (id: number, newPassword: string) => api.patch(`/users/${id}/reset-password`, { newPassword }),

    // เพิ่ม: จัดการความรับผิดชอบเตา (User-Kiln Assignment)
    getUserKilns: (userId: number) => api.get(`/users/${userId}/kilns`),
    assignKiln: (userId: number, kilnId: number) => api.post(`/users/${userId}/kilns`, { kiln_id: kilnId }),
    unassignKiln: (userId: number, kilnId: number) => api.delete(`/users/${userId}/kilns/${kilnId}`),
};


export const kilnApi = {
    getAll: () => api.get('/kilns'),
    create: (data: any) => api.post('/kilns', data),
    update: (id: number, data: any) => api.put(`/kilns/${id}`, data), // เพิ่ม: แก้ไขข้อมูลเตา
    toggleActive: (id: number, active: boolean) => api.patch(`/kilns/${id}/active`, { is_active: active }), // เพิ่ม: เปิด/ปิดเตา
};

export const experimentApi = {
    getAll: (params?: any) => api.get('/experiments', { params }), // ปรับ: ให้รองรับ Query params สำหรับ Filter
    getDetail: (id: number | string) => api.get(`/experiments/${id}`),
    create: (data: { kiln_id: number; burn_hours?: number; initial_moisture?: string }) => api.post('/experiments', data),
    addMaterial: (id: number | string, data: any) => api.post(`/experiments/${id}/materials`, data),
    updateResult: (id: number | string, data: any) => api.patch(`/experiments/${id}/results`, data),
};

export const woodSpeciesApi = {
    getAll: (activeOnly = false) => api.get('/wood-species', { params: { active_only: activeOnly } }),
    create: (name: string) => api.post('/wood-species', { name }),
    update: (id: number, name: string) => api.put(`/wood-species/${id}`, { name }),
    toggleActive: (id: number, active: boolean) => api.patch(`/wood-species/${id}/active`, { is_active: active }),
    delete: (id: number) => api.delete(`/wood-species/${id}`),
};

export const dashboardApi = {
    getStats: () => api.get('/dashboard/stats'),
    getAnnualReport: (year?: string | number) => api.get('/dashboard/report/annual', { params: { year } }),
};

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    getLogs: () => api.get('/admin/logs'),
    getErrors: () => api.get('/admin/errors'),
    getMetrics: () => api.get('/admin/metrics'),
    performBackup: () => api.post('/admin/backup'),
};
