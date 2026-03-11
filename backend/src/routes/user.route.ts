// src/routes/user.route.ts
import { Elysia, t } from 'elysia';
import { UserController } from '../controllers/user.controller';

export const userRoutes = (app: Elysia) =>
    app.group('/users', (group) =>
        group
            .get('/', UserController.getAll)

            .post('/', UserController.create, {
                body: t.Object({
                    name: t.String(),
                    phone: t.String(),
                    role: t.String({ pattern: '^(researcher|operator|admin)$' }),
                    password: t.Optional(t.String())
                })
            })

            .put('/:id', UserController.update, {
                params: t.Object({ id: t.Numeric() }),
                body: t.Object({
                    name: t.String(),
                    phone: t.String(),
                    role: t.String({ pattern: '^(researcher|operator|admin)$' })
                })
            })

            .patch('/:id/active', UserController.toggleActive, {
                params: t.Object({ id: t.Numeric() }),
                body: t.Object({
                    is_active: t.Boolean()
                })
            })

            .patch('/:id/reset-password', UserController.resetPassword, {
                params: t.Object({ id: t.Numeric() }),
                body: t.Object({
                    newPassword: t.String()
                })
            })
    );