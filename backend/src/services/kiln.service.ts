import db from '../db';

export const KilnService = {
    getAll: () => {
        return db.query("SELECT * FROM kilns").all();
    },

    create: (data: { name: string, location: string, description?: string }) => {
        const result = db.prepare(`
            INSERT INTO kilns (name, location, description) 
            VALUES (?, ?, ?)
        `).run(data.name, data.location, data.description || null);
        return result.lastInsertRowid;
    },

    update: (id: number, data: { name: string, location: string, description?: string }) => {
        const result = db.prepare(`
            UPDATE kilns SET name = ?, location = ?, description = ? 
            WHERE kiln_id = ?
        `).run(data.name, data.location, data.description || null, id);
        return result.changes > 0;
    },

    toggleActive: (id: number, isActive: boolean) => {
        const status = isActive ? 1 : 0;
        const result = db.prepare("UPDATE kilns SET is_active = ? WHERE kiln_id = ?").run(status, id);
        return result.changes > 0;
    }
};
