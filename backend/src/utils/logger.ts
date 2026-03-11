// src/utils/logger.ts
import db from '../db';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SECURITY';

export const Logger = {
    /**
     * บันทึกประวัติการใช้งาน (Audit Trail)
     */
    activity: (userId: number | null, action: string, target?: string, detail?: any, ip?: string, userAgent?: string) => {
        try {
            const detailStr = typeof detail === 'object' ? JSON.stringify(detail) : detail;
            db.prepare(`
                INSERT INTO activity_logs (user_id, action, target, detail, ip, user_agent)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(userId, action, target, detailStr, ip || null, userAgent || null);

            console.log(`[ACTIVITY] ${action} by User(${userId}) on ${target}`);
        } catch (e) {
            console.error("Failed to write activity log:", e);
        }
    },

    /**
     * บันทึกข้อผิดพลาดของระบบลงฐานข้อมูล
     */
    error: (message: string, stack?: string, endpoint?: string, method?: string, userId?: number | null) => {
        try {
            db.prepare(`
                INSERT INTO error_logs (error_message, stack_trace, endpoint, method, user_id)
                VALUES (?, ?, ?, ?, ?)
            `).run(message, stack || null, endpoint || null, method || null, userId || null);

            console.error(`[ERROR] ${message} at ${method} ${endpoint}`);
        } catch (e) {
            console.error("Failed to write error log:", e);
        }
    },

    /**
     * บันทึกข้อความลง Console (Standard logging)
     */
    log: (level: LogLevel, message: string, data?: any) => {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}]`;

        switch (level) {
            case 'ERROR':
                console.error(`${prefix} ${message}`, data || '');
                break;
            case 'WARN':
                console.warn(`${prefix} ${message}`, data || '');
                break;
            default:
                console.log(`${prefix} ${message}`, data || '');
        }
    }
};
