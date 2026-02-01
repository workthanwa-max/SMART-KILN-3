import { Elysia, t } from 'elysia';
import { AuthController } from '../controllers/auth.controller';

export const authRoutes = (app: Elysia) =>
    app.group('/auth', (group) =>
        group
            .post('/login', AuthController.login, {
                body: t.Object({
                    phone: t.String(),
                    password: t.String()
                })
            })
            .post('/change-password', AuthController.updatePassword, {
                body: t.Object({
                    newPassword: t.String()
                })
            })
            .get('/me', AuthController.getMe)
    );