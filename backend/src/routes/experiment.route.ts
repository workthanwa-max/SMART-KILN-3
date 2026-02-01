// src/routes/experiment.route.ts
import { Elysia, t } from 'elysia';
import { ExperimentController } from '../controllers/experiment.controller';

export const experimentRoutes = (app: Elysia) =>
    app.group('/experiments', (group) =>
        group
            .onBeforeHandle(({ user, set }: any) => {
                if (!user) {
                    set.status = 401;
                    return { error: 'Unauthorized' };
                }
            })
            // ดึงรายการทั้งหมด
            .get('/', ExperimentController.getAll)

            // สร้างการทดลองใหม่
            .post('/', ExperimentController.create, {
                body: t.Object({
                    kiln_id: t.Number(),
                    burn_hours: t.Optional(t.Number()),
                    initial_moisture: t.Optional(t.String())
                })
            })

            // ดูรายละเอียด + วัตถุดิบ
            .get('/:id', ExperimentController.getDetail, {
                params: t.Object({ id: t.Numeric() })
            })

            // เพิ่มวัตถุดิบลงในการทดลอง
            .post('/:id/materials', ExperimentController.addMaterial, {
                params: t.Object({ id: t.Numeric() }),
                body: t.Object({
                    wood_type: t.String(),
                    quantity: t.Number(),
                    condition: t.String({ pattern: '^(dry|fresh)$' })
                })
            })

            // อัปเดตผลลัพธ์การเผา
            .patch('/:id/results', ExperimentController.updateResult, {
                params: t.Object({ id: t.Numeric() }),
                body: t.Object({
                    charcoal_weight: t.Number(),
                    bag_count: t.Number(),
                    burn_hours: t.Number(),
                    quality_grade: t.String({ pattern: '^(ดี|พอใช้|แย่)$' }),
                    final_moisture: t.Optional(t.String()),
                    summary_note: t.Optional(t.String())
                })
            })
    );