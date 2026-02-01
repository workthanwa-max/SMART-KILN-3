import db from '../db';

export const UserController = {
    getAll: ({ user, set }: any) => {
        const baseQuery = "SELECT user_id, name, phone, role, is_active, created_at, must_change_password FROM users";

        if (user.role === 'researcher') {
            return db.query(`${baseQuery} ORDER BY created_at DESC`).all();
        }

        return db.query(`${baseQuery} WHERE user_id = ?`).all(user.id);
    },

    create: async ({ body, user, set }: any) => {
        if (!user || user.role !== 'researcher') {
            set.status = 403;
            return { error: "Forbidden" };
        }

        try {
            const { name, phone, role, password } = body;
            const hashedPassword = await Bun.password.hash(password || "123456");
            const result = db.prepare(`
                INSERT INTO users (name, phone, role, password, must_change_password) 
                VALUES (?, ?, ?, ?, 1)
            `).run(name, phone, role, hashedPassword);

            return { success: true, id: result.lastInsertRowid };
        } catch (error: any) {
            set.status = 400;
            if (error.message.includes('UNIQUE constraint failed')) {
                return { error: "เบอร์โทรศัพท์นี้มีในระบบแล้ว" };
            }
            return { error: error.message };
        }
    },

    update: ({ params, body, user, set }: any) => {
        if (!user || user.role !== 'researcher') {
            set.status = 403;
            return { error: "Forbidden" };
        }

        try {
            const { name, phone, role } = body;
            const result = db.prepare(`
                UPDATE users SET name = ?, phone = ?, role = ? 
                WHERE user_id = ?
            `).run(name, phone, role, params.id);

            if (result.changes === 0) {
                set.status = 404;
                return { error: "ไม่พบผู้ใช้งานที่ต้องการแก้ไข" };
            }
            return { success: true, message: "User updated" };
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    },

    resetPassword: async ({ params, body, user, set }: any) => {
        if (!user || user.role !== 'researcher') {
            set.status = 403;
            return { error: "Forbidden" };
        }

        try {
            const { newPassword } = body;
            const hashedPassword = await Bun.password.hash(newPassword);
            db.prepare("UPDATE users SET password = ?, must_change_password = 1 WHERE user_id = ?")
                .run(hashedPassword, params.id);

            return { success: true, message: "รีเซ็ตรหัสผ่านสำเร็จ (ผู้ใช้จะต้องเปลี่ยนรหัสเองเมื่อเข้าสู่ระบบครั้งถัดไป)" };
        } catch (error: any) {
            set.status = 500;
            return { error: error.message };
        }
    },

    toggleActive: ({ params, body, user, set }: any) => {
        if (!user || user.role !== 'researcher') {
            set.status = 403;
            return { error: "Forbidden" };
        }

        const status = body.is_active ? 1 : 0;
        db.prepare("UPDATE users SET is_active = ? WHERE user_id = ?")
            .run(status, params.id);

        return { success: true, message: `สถานะผู้ใช้ถูกเปลี่ยนเป็น ${body.is_active ? 'เปิด' : 'ปิด'}` };
    }
};