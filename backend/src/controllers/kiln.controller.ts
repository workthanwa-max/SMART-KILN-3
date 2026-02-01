import db from '../db';

export const KilnController = {
    getAll: () => {
        // ทุกคน (ทั้ง Researcher และ Operator) สามารถดูเตาได้
        return db.query("SELECT * FROM kilns ORDER BY kiln_id DESC").all();
    },

    create: ({ body, user, set }: any) => {
        // เช็คสิทธิ์นักวิจัย
        if (user.role !== 'researcher') {
            set.status = 403;
            return { error: "สิทธิ์ไม่เพียงพอ: เฉพาะนักวิจัยเท่านั้นที่เพิ่มเตาได้" };
        }

        try {
            const { name, location, latitude, longitude, note } = body;
            const result = db.prepare(`
                INSERT INTO kilns (name, location, latitude, longitude, note) 
                VALUES (?, ?, ?, ?, ?)
            `).run(name, location, latitude, longitude, note);

            return {
                success: true,
                id: result.lastInsertRowid,
                message: "สร้างเตาเผาใหม่เรียบร้อยแล้ว"
            };
        } catch (error: any) {
            set.status = 500;
            return { error: "ไม่สามารถสร้างข้อมูลได้: " + error.message };
        }
    },

    update: ({ params, body, user, set }: any) => {
        if (user.role !== 'researcher') {
            set.status = 403;
            return { error: "Forbidden" };
        }

        const { name, location, latitude, longitude, note } = body;
        const result = db.prepare(`
            UPDATE kilns SET name = ?, location = ?, latitude = ?, longitude = ?, note = ? 
            WHERE kiln_id = ?
        `).run(name, location, latitude, longitude, note, params.id);

        if (result.changes === 0) {
            set.status = 404;
            return { error: "ไม่พบเตาที่ต้องการแก้ไข" };
        }

        return { success: true, message: "แก้ไขข้อมูลเตาเรียบร้อยแล้ว" };
    },

    toggleActive: ({ params, body, user, set }: any) => {
        if (user.role !== 'researcher') {
            set.status = 403;
            return { error: "Forbidden" };
        }

        const status = body.is_active ? 1 : 0;
        db.prepare("UPDATE kilns SET is_active = ? WHERE kiln_id = ?")
            .run(status, params.id);

        return {
            success: true,
            message: `เปลี่ยนสถานะเตาเป็น ${body.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}`
        };
    }
};