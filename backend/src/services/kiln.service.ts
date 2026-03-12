import db from '../db';

export const KilnService = {
    getAll: () => {
        return db.query("SELECT * FROM kilns").all();
    },

    create: (data: { name: string, location?: string, latitude?: string, longitude?: string, note?: string, image?: string }) => {
        const result = db.prepare(`
            INSERT INTO kilns (name, location, latitude, longitude, note, image) 
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(data.name, data.location || null, data.latitude || null, data.longitude || null, data.note || null, data.image || null);
        return result.lastInsertRowid;
    },

    update: (id: number, data: { name: string, location?: string, latitude?: string, longitude?: string, note?: string, image?: string }) => {
        const result = db.prepare(`
            UPDATE kilns SET name = ?, location = ?, latitude = ?, longitude = ?, note = ?, image = ? 
            WHERE kiln_id = ?
        `).run(data.name, data.location || null, data.latitude || null, data.longitude || null, data.note || null, data.image || null, id);
        return result.changes > 0;
    },

    toggleActive: (id: number, isActive: boolean) => {
        const status = isActive ? 1 : 0;
        const result = db.prepare("UPDATE kilns SET is_active = ? WHERE kiln_id = ?").run(status, id);
        return result.changes > 0;
    }
};
