import db from '../db';

export const UserKilnController = {
    // ดึงข้อมูล user_kilns ทั้งหมด (สำหรับ sync)
    // ดึงข้อมูล user_kilns ทั้งหมด (สำหรับ sync)
    getAll: ({ user, set }: any) => {
        if (user.role === 'researcher') {
            return db.query(`SELECT * FROM user_kilns`).all();
        }

        return db.query(`SELECT * FROM user_kilns WHERE user_id = ?`).all(user.id);
    },

    // ดูเตาทั้งหมดที่ผูกกับ User คนนี้
    getByUserId: ({ params, user, set }: any) => {
        // เงื่อนไข: Researcher ดูได้ทุกคน หรือ Operator ดูได้เฉพาะของตัวเอง
        if (user.role !== 'researcher' && user.id !== params.id) {
            set.status = 403;
            return { error: "Forbidden: สิทธิ์ไม่ถูกต้อง" };
        }

        return db.query(`
            SELECT k.* FROM kilns k
            JOIN user_kilns uk ON k.kiln_id = uk.kiln_id
            WHERE uk.user_id = ?
        `).all(params.id);
    },

    // ผูกเตาให้กับ User (Researcher Only)
    assignKiln: ({ params, body, user, set }: any) => {
        if (user.role !== 'researcher') {
            set.status = 403;
            return { error: "สิทธิ์ไม่เพียงพอ" };
        }

        try {
            const user_id = params.id;
            const { kiln_id } = body;

            // ตรวจสอบว่าเตานี้มีอยู่ในระบบจริงหรือไม่
            const kilnExists = db.query("SELECT kiln_id FROM kilns WHERE kiln_id = ?").get(kiln_id);
            if (!kilnExists) {
                set.status = 404;
                return { error: "ไม่พบเตาที่ระบุในระบบ" };
            }

            // ตรวจสอบความซ้ำซ้อน
            const exists = db.query("SELECT id FROM user_kilns WHERE user_id = ? AND kiln_id = ?")
                .get(user_id, kiln_id);

            if (exists) {
                set.status = 400;
                return { error: "เตานี้ถูกผูกกับผู้ใช้รายนี้อยู่แล้ว" };
            }

            db.prepare("INSERT INTO user_kilns (user_id, kiln_id) VALUES (?, ?)")
                .run(user_id, kiln_id);

            return { success: true, message: "ผูกเตาเรียบร้อยแล้ว" };
        } catch (e: any) {
            set.status = 500;
            return { error: "Database Error: " + e.message };
        }
    },

    // ยกเลิกการผูกเตา (Researcher Only)
    unassignKiln: ({ params, user, set }: any) => {
        if (user.role !== 'researcher') {
            set.status = 403;
            return { error: "Forbidden" };
        }

        const result = db.prepare("DELETE FROM user_kilns WHERE user_id = ? AND kiln_id = ?")
            .run(params.id, params.kilnId);

        if (result.changes === 0) {
            set.status = 404;
            return { error: "ไม่พบรายการที่ต้องการลบ" };
        }

        return { success: true, message: "ยกเลิกการผูกเตาเรียบร้อยแล้ว" };
    }
};