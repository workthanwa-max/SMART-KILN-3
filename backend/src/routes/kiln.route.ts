// src/routes/kiln.route.ts
import { Elysia, t } from 'elysia';
import { KilnController } from '../controllers/kiln.controller';

export const kilnRoutes = (app: Elysia) =>
    app.group('/kilns', (group) =>
        group
            // เช็คสิทธิ์พื้นฐาน (ต้อง Login ก่อน)
            .onBeforeHandle(({ user, set }) => {
                if (!user) {
                    set.status = 401;
                    return { error: 'Unauthorized' };
                }
            })
            .get('/', KilnController.getAll)

            .post('/', KilnController.create, {
                body: t.Object({
                    name: t.String(),
                    location: t.Optional(t.String()),
                    latitude: t.Optional(t.Number()),
                    longitude: t.Optional(t.Number()),
                    note: t.Optional(t.String())
                })
            })

            .put('/:id', KilnController.update, {
                params: t.Object({ id: t.Numeric() }),
                body: t.Object({
                    name: t.String(),
                    location: t.Optional(t.String()),
                    latitude: t.Optional(t.Number()),
                    longitude: t.Optional(t.Number()),
                    note: t.Optional(t.String())
                })
            })

            .patch('/:id/active', KilnController.toggleActive, {
                params: t.Object({ id: t.Numeric() }),
                body: t.Object({
                    is_active: t.Boolean()
                })
            })
    );