// src/index.ts
import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/auth.route';
import { userRoutes } from './routes/user.route';
import { kilnRoutes } from './routes/kiln.route';
import { userKilnRoutes } from './routes/user-kiln.route';
import { experimentRoutes } from './routes/experiment.route';
import { dashboardRoutes } from './routes/dashboard.route';

const app = new Elysia()
    .use(cors())
    .use(
        jwt({
            name: 'jwt',
            secret: process.env.JWT_SECRET || 'default_secret_if_not_found',
            exp: '7d'
        })
    )
    // --- Error Logging & Handling ---
    .onError(({ code, error, set, request }) => {
        console.error(`❌ [${new Date().toLocaleString()}] Error on ${request.method} ${request.url}`);
        console.error(`Code: ${code}`);
        console.error(`Message: ${error.message}`);
        
        // ถ้าเป็น Error จาก Validation (ข้อมูลที่ส่งมาไม่ตรงตาม t.Object)
        if (code === 'VALIDATION') {
            set.status = 400;
            return {
                status: 'error',
                type: 'validation',
                message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
                details: error.all // แสดงรายละเอียดฟิลด์ที่ผิด
            };
        }

        // Error อื่นๆ ทั่วไป
        return {
            status: 'error',
            code,
            message: error.message
        };
    })
    // -------------------------------
    // ปรับปรุงส่วน derive ใน src/index.ts
.derive(async ({ jwt, headers }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    
    if (!token) return { user: null };

    const payload = await jwt.verify(token);
    
    // ถ้า token ผิดหรือหมดอายุ payload จะเป็น false
    if (!payload) return { user: null };

    // คืนค่า payload ออกไปเป็น object user
    return { user: payload };
})
    .get("/", () => ({ 
        status: "Online", 
        env: process.env.NODE_ENV || 'development',
        time: new Date().toISOString()
    }))
    .use(authRoutes)
    .use(userRoutes)
    .use(kilnRoutes)
    .use(userKilnRoutes)
    .use(experimentRoutes)
    .use(dashboardRoutes)
    .listen(Number(process.env.PORT) || 3000);

console.log(`🚀 Server running at ${app.server?.hostname}:${app.server?.port}`);