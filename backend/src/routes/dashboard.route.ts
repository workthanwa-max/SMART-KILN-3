// src/routes/dashboard.route.ts
import { Elysia } from 'elysia';
import { DashboardController } from '../controllers/dashboard.controller';

export const dashboardRoutes = (app: Elysia) =>
    app.group('/dashboard', (group) =>
        group
            .onBeforeHandle(({ user, set }) => {
                if (!user) {
                    set.status = 401;
                    return { error: 'Unauthorized' };
                }
            })
            .get('/stats', DashboardController.getStats)
            .get('/report/annual', DashboardController.getAnnualReport)
    );