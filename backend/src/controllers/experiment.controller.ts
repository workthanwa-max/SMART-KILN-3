import db from '../db';

export const ExperimentController = {
    // 1. ดูรายการทั้งหมด (แยกสิทธิ์)
    getAll: ({ user }: any) => {
        let experiments;
        // ถ้าเป็น Researcher ให้ดูได้ทั้งหมด
        if (user.role === 'researcher') {
            experiments = db.query(`
                SELECT e.*, u.name as operator_name, k.name as kiln_name,
                       (SELECT SUM(quantity) FROM experiment_materials WHERE experiment_id = e.experiment_id) as total_wood_weight
                FROM experiments e
                JOIN users u ON e.operator_id = u.user_id
                JOIN kilns k ON e.kiln_id = k.kiln_id
                ORDER BY e.created_at DESC
            `).all() as any[];
        } else {
            // ถ้าเป็น Operator ให้ดูได้เฉพาะของตัวเอง
            experiments = db.query(`
                SELECT e.*, u.name as operator_name, k.name as kiln_name,
                       (SELECT SUM(quantity) FROM experiment_materials WHERE experiment_id = e.experiment_id) as total_wood_weight
                FROM experiments e
                JOIN users u ON e.operator_id = u.user_id
                JOIN kilns k ON e.kiln_id = k.kiln_id
                WHERE e.operator_id = ?
                ORDER BY e.created_at DESC
            `).all(user.id) as any[];
        }

        return experiments.map(e => ({
            ...e,
            yield_percent: e.charcoal_weight && e.total_wood_weight && e.total_wood_weight > 0
                ? (e.charcoal_weight / e.total_wood_weight) * 100
                : 0
        }));
    },

    // 2. สร้างการทดลองใหม่
    create: ({ body, user, set }: any) => {
        try {
            const { kiln_id, burn_hours, initial_moisture } = body;

            // เช็คว่าเตาเปิดใช้งานอยู่หรือไม่
            const kiln = db.query("SELECT is_active FROM kilns WHERE kiln_id = ?").get(kiln_id) as any;
            if (!kiln || kiln.is_active === 0) {
                set.status = 400;
                return { error: "ไม่สามารถเริ่มการเผาได้เนื่องจากเตาปิดใช้งานอยู่" };
            }

            const result = db.prepare(`
                INSERT INTO experiments (operator_id, kiln_id, burn_hours, initial_moisture) 
                VALUES (?, ?, ?, ?)
            `).run(user.id, kiln_id, burn_hours || 0, initial_moisture || null);

            return { success: true, experiment_id: result.lastInsertRowid };
        } catch (e: any) {
            set.status = 500;
            return { error: e.message };
        }
    },

    // 3. เพิ่มวัตถุดิบ
    addMaterial: ({ params, body, set }: any) => {
        const { wood_type, quantity, condition } = body;

        // เช็คก่อนว่ามี experiment นี้อยู่จริงไหม
        const expExists = db.query("SELECT experiment_id FROM experiments WHERE experiment_id = ?").get(params.id);
        if (!expExists) {
            set.status = 404;
            return { error: "ไม่พบรายการทดลองนี้" };
        }

        db.prepare(`
            INSERT INTO experiment_materials (experiment_id, wood_type, quantity, condition)
            VALUES (?, ?, ?, ?)
        `).run(params.id, wood_type, quantity, condition);

        return { success: true, message: "เพิ่มข้อมูลวัตถุดิบเรียบร้อย" };
    },

    // 4. บันทึกผลการทดลอง
    updateResult: ({ params, body, set }: any) => {
                const { charcoal_weight, bag_count, quality_grade, final_moisture, summary_note, burn_hours, wood_vinegar_quantity, temperature } = body;
        
                const result = db.prepare(`
                    UPDATE experiments SET
                        charcoal_weight = ?,
                        bag_count = ?,
                        quality_grade = ?,
                        final_moisture = ?,
                        summary_note = ?,
                        burn_hours = ?,
                        wood_vinegar_quantity = ?,
                        temperature = ?
                    WHERE experiment_id = ?
                `).run(charcoal_weight, bag_count, quality_grade, final_moisture || null, summary_note, burn_hours, wood_vinegar_quantity || null, temperature || null, params.id);
        if (result.changes === 0) {
            set.status = 404;
            return { error: "ไม่พบรายการทดลองที่ต้องการอัปเดต" };
        }

        return { success: true, message: "บันทึกผลการทดลองเรียบร้อย" };
    },

    // 5. ดูรายละเอียด
    getDetail: ({ params, set }: any) => {
        const experiment = db.query(`
            SELECT e.*, u.name as operator_name, k.name as kiln_name,
                   (SELECT SUM(quantity) FROM experiment_materials WHERE experiment_id = e.experiment_id) as total_wood_weight
            FROM experiments e
            JOIN users u ON e.operator_id = u.user_id
            JOIN kilns k ON e.kiln_id = k.kiln_id
            WHERE e.experiment_id = ?
        `).get(params.id) as any;

        if (!experiment) {
            set.status = 404;
            return { error: "ไม่พบข้อมูล" };
        }

        const materials = db.query("SELECT * FROM experiment_materials WHERE experiment_id = ?").all(params.id);

        const yield_percent = experiment.charcoal_weight && experiment.total_wood_weight && experiment.total_wood_weight > 0
            ? (experiment.charcoal_weight / experiment.total_wood_weight) * 100
            : 0;

        return { ...experiment, materials, yield_percent };
    }
};