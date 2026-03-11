// src/index.ts
process.env.TZ = 'Asia/Bangkok';
import { Elysia } from 'elysia';
import db from './db';
import { jwt } from '@elysiajs/jwt';
import { cors } from '@elysiajs/cors';
import { ResponseUtil } from './utils/response';
import { authRoutes } from './routes/auth.route';
import { userRoutes } from './routes/user.route';
import { kilnRoutes } from './routes/kiln.route';
import { userKilnRoutes } from './routes/user-kiln.route';
import { experimentRoutes } from './routes/experiment.route';
import { dashboardRoutes } from './routes/dashboard.route';
import { woodSpeciesRoutes } from './routes/wood-species.route';
import { adminRoutes } from './routes/admin.route';
import { helmet } from 'elysia-helmet';
import { rateLimit } from 'elysia-rate-limit';
import { Logger } from './utils/logger';
import { seedInitialAccounts } from './db/seed';

if (!process.env.JWT_SECRET) {
    throw new Error('❌ JWT_SECRET is not set in environment variables!');
}

const app = new Elysia({ strictPath: false })
    .use(helmet())
    .use(rateLimit({
        max: 300, // Increase limit to 300 requests per minute
        duration: 60000, // 1 minute
        skip: (request) => request.method === 'OPTIONS' || request.method === 'HEAD' // Skip CORS preflight and HEAD requests
    }))
    .use(cors({
        origin: [/localhost:5173$/, /localhost:3000$/],
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type']
    }))
    .use(
        jwt({
            name: 'jwt',
            secret: process.env.JWT_SECRET!,
            exp: '7d'
        })
    )
    // --- Error Logging & Handling ---
    .onError(({ code, error, set, request }) => {
        // Log error to database [Requirements 4: Error Monitoring]
        Logger.error(
            (error as any).message || error.toString(),
            (error as any).stack,
            request.url,
            request.method,
            (request as any).user?.id
        );

        // ถ้าเป็น Error จาก Validation (ข้อมูลที่ส่งมาไม่ตรงตาม t.Object)
        if (code === 'VALIDATION') {
            set.status = 400;
            return ResponseUtil.error('ข้อมูลที่ส่งมาไม่ถูกต้อง', 'VALIDATION_ERROR', error.all);
        }

        // Error อื่นๆ ทั่วไป
        return ResponseUtil.error((error as any).message, code.toString());
    })
    // -------------------------------
    // Hardened derivation: check if user still exists and is active
    .derive(async ({ jwt, headers }) => {
        const auth = headers['authorization'];
        const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;

        if (!token) return { user: null };

        const payload = await jwt.verify(token);
        if (!payload) return { user: null };

        // [S1] Harden JWT Verification: Check DB for current status
        const { id } = payload as any;
        if (!id) return { user: null };

        const dbUser = db.query("SELECT user_id as id, name, phone, role, is_active FROM users WHERE user_id = ?").get(id) as any;

        if (!dbUser || dbUser.is_active === 0) {
            return { user: null };
        }

        return { user: dbUser };
    })
    .get("/", () => ({
        status: "Online",
        env: process.env.NODE_ENV || 'development',
        time: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
        iso_time: new Date().toISOString()
    }))
    .get("/ping", () => "pong")
    .use(authRoutes)
    .use(userRoutes)
    .use(kilnRoutes)
    .use(userKilnRoutes)
    .use(experimentRoutes)
    .use(dashboardRoutes)
    .use(woodSpeciesRoutes)
    .use(adminRoutes);

// Run database seeding
await seedInitialAccounts();

app.listen(Number(process.env.PORT) || 3000);

console.log(`🚀 Server running at ${app.server?.hostname}:${app.server?.port}`);
Logger.log('INFO', `Server started on port ${process.env.PORT || 3000}`);