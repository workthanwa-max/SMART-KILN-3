import { Elysia } from 'elysia';
import { AdminController } from '../controllers/admin.controller';

export const adminRoutes = (app: Elysia) =>
    app.group('/admin', (group) =>
        group
            .get('/stats', AdminController.getStats)
            .get('/logs', AdminController.getActivityLogs)
            .get('/errors', AdminController.getErrorLogs)
            .get('/metrics', AdminController.getSystemMetrics)
            .post('/backup', AdminController.performBackup)
    );
