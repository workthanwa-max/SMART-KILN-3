import { Elysia, t } from 'elysia';
import { WoodSpeciesController } from '../controllers/wood-species.controller';

export const woodSpeciesRoutes = (app: Elysia) =>
    app
        .onBeforeHandle(({ user, set }: any) => {
            if (!user) {
                set.status = 401;
                return { error: 'Unauthorized' };
            }
        })
        // ดึงรายการทั้งหมด
        .get('/wood-species', WoodSpeciesController.getAll, {
            query: t.Object({
                active_only: t.Optional(t.String())
            })
        })
        // สร้างพันธุ์ไม้ใหม่ (Researcher Only)
        .post('/wood-species', WoodSpeciesController.create, {
            onBeforeHandle: ({ user, set }: any) => {
                if (user.role !== 'researcher') {
                    set.status = 403;
                    return { error: 'Forbidden' };
                }
            },
            body: t.Object({
                name: t.String({ minLength: 1 })
            })
        })
        // อัปเดตพันธุ์ไม้ (Researcher Only)
        .put('/wood-species/:id', WoodSpeciesController.update, {
            onBeforeHandle: ({ user, set }: any) => {
                if (user.role !== 'researcher') {
                    set.status = 403;
                    return { error: 'Forbidden' };
                }
            },
            params: t.Object({ id: t.Numeric() }),
            body: t.Object({
                name: t.String({ minLength: 1 })
            })
        })
        // เปิด/ปิดการใช้งาน (Researcher Only)
        .patch('/wood-species/:id/active', WoodSpeciesController.toggleActive, {
            onBeforeHandle: ({ user, set }: any) => {
                if (user.role !== 'researcher') {
                    set.status = 403;
                    return { error: 'Forbidden' };
                }
            },
            params: t.Object({ id: t.Numeric() }),
            body: t.Object({
                is_active: t.Boolean()
            })
        })
        // ลบพันธุ์ไม้ (Researcher Only)
        .delete('/wood-species/:id', WoodSpeciesController.delete, {
            onBeforeHandle: ({ user, set }: any) => {
                if (user.role !== 'researcher') {
                    set.status = 403;
                    return { error: 'Forbidden' };
                }
            },
            params: t.Object({ id: t.Numeric() })
        });
