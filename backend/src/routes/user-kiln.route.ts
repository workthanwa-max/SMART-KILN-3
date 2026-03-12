// src/routes/user-kiln.route.ts
import { Elysia, t } from 'elysia';
import { UserKilnController } from '../controllers/user-kiln.controller';

export const userKilnRoutes = (app: Elysia) =>
    app
        // GET /user-kilns - ดึงข้อมูลการมอบหมายเตาทั้งหมด (สำหรับ sync)
        .get('/user-kilns', UserKilnController.getAll, {
            beforeHandle: ({ user, set }: any) => {
                if (!user) {
                    set.status = 401;
                    return { error: 'Unauthorized' };
                }
            }
        })
        .group('/users/:id/kilns', (group) =>
            group
                .onBeforeHandle(({ user, set }: any) => {
                    if (!user) {
                        set.status = 401;
                        return { error: 'Unauthorized' };
                    }
                })
                // GET /users/:id/kilns
                .get('/', UserKilnController.getByUserId, {
                    params: t.Object({ id: t.Numeric() })
                })
                // POST /users/:id/kilns
                .post('/', UserKilnController.assignKiln, {
                    params: t.Object({ id: t.Numeric() }),
                    body: t.Object({
                        kiln_id: t.Numeric()
                    })
                })
                // DELETE /users/:id/kilns/:kilnId
                .delete('/:kilnId', UserKilnController.unassignKiln, {
                    params: t.Object({
                        id: t.Numeric(),
                        kilnId: t.Numeric()
                    })
                })
        );