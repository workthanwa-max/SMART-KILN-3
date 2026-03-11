import db from '../db';

export const WoodSpeciesService = {
    getAll: (activeOnly: boolean = false) => {
        let sql = "SELECT * FROM wood_species";
        if (activeOnly) {
            sql += " WHERE is_active = 1";
        }
        sql += " ORDER BY name ASC";
        return db.query(sql).all();
    },

    create: (name: string) => {
        const result = db.prepare("INSERT INTO wood_species (name) VALUES (?)").run(name);
        return result.lastInsertRowid;
    },

    update: (id: number, name: string) => {
        const result = db.prepare("UPDATE wood_species SET name = ? WHERE species_id = ?")
            .run(name, id);
        return result.changes > 0;
    },

    toggleActive: (id: number, isActive: boolean) => {
        const result = db.prepare("UPDATE wood_species SET is_active = ? WHERE species_id = ?")
            .run(isActive ? 1 : 0, id);
        return result.changes > 0;
    },

    delete: (id: number) => {
        const species = db.query("SELECT name FROM wood_species WHERE species_id = ?").get(id) as any;
        if (!species) return { success: false, error: "NOT_FOUND" };

        const isUsed = db.query("SELECT COUNT(*) as count FROM experiment_materials WHERE wood_type = ?").get(species.name) as any;
        if (isUsed.count > 0) {
            return { success: false, error: "USED" };
        }

        db.prepare("DELETE FROM wood_species WHERE species_id = ?").run(id);
        return { success: true };
    }
};
