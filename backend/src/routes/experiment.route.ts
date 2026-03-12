// src/routes/experiment.route.ts
import { Elysia, t } from 'elysia';
import { ExperimentController } from '../controllers/experiment.controller';

export const experimentRoutes = (app: Elysia) =>
    app
        .onBeforeHandle(({ user, set }: any) => {
            if (!user) {
                set.status = 401;
                return { error: 'Unauthorized' };
            }
        })
        // 1. Static Routes (Must come before dynamic routes)
        .get('/experiments', ExperimentController.getAll)
        .get('/experiments/materials', ExperimentController.getAllMaterials)

        // 2. Creation Route
        .post('/experiments', ExperimentController.create, {
            body: t.Object({
                kiln_id: t.Number(),
                burn_hours: t.Optional(t.Number()),
                initial_moisture: t.Optional(t.String())
            })
        })

        // 3. Dynamic Routes (ID based)
        .get('/experiments/:id([0-9]+)', ExperimentController.getDetail, {
            params: t.Object({ id: t.Numeric() })
        })

        .post('/experiments/:id([0-9]+)/materials', ExperimentController.addMaterial, {
            params: t.Object({ id: t.Numeric() }),
            body: t.Object({
                wood_type: t.String(),
                quantity: t.Number(),
                condition: t.String({ pattern: '^(dry|fresh)$' })
            })
        })

        .patch('/experiments/:id([0-9]+)/results', ExperimentController.updateResult, {
            params: t.Object({ id: t.Numeric() }),
            body: t.Object({
                charcoal_weight: t.Number(),
                bag_count: t.Number(),
                burn_hours: t.Number(),
                quality_grade: t.String({ pattern: '^(ดี|พอใช้|แย่)$' }),
                final_moisture: t.Optional(t.String()),
                summary_note: t.Optional(t.String())
            })
        });