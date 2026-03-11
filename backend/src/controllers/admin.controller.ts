import db from '../db';

export const AdminController = {
    getStats: ({ user, set }: any) => {
        if (!user || user.role !== 'admin') {
            set.status = 403;
            return { error: "Forbidden" };
        }

        try {
            const userCount = db.query("SELECT COUNT(*) as count FROM users").get() as any;
            const kilnCount = db.query("SELECT COUNT(*) as count FROM kilns").get() as any;
            const expCount = db.query("SELECT COUNT(*) as count FROM experiments").get() as any;
            const charcoalTotal = db.query("SELECT SUM(charcoal_weight) as total FROM experiments").get() as any;
            const activeUsers = db.query("SELECT COUNT(*) as count FROM users WHERE is_active = 1").get() as any;

            return {
                users: userCount.count,
                activeUsers: activeUsers.count,
                kilns: kilnCount.count,
                experiments: expCount.count,
                charcoalTotal: charcoalTotal.total || 0
            };
        } catch (error: any) {
            set.status = 500;
            return { error: error.message };
        }
    },

    getActivityLogs: ({ user, set }: any) => {
        if (!user || user.role !== 'admin') {
            set.status = 403;
            return { error: "Forbidden" };
        }
        return db.query(`
            SELECT a.*, u.name as user_name 
            FROM activity_logs a 
            LEFT JOIN users u ON a.user_id = u.user_id 
            ORDER BY a.created_at DESC LIMIT 100
        `).all();
    },

    getErrorLogs: ({ user, set }: any) => {
        if (!user || user.role !== 'admin') {
            set.status = 403;
            return { error: "Forbidden" };
        }
        return db.query(`
            SELECT e.*, u.name as user_name 
            FROM error_logs e 
            LEFT JOIN users u ON e.user_id = u.user_id 
            ORDER BY e.created_at DESC LIMIT 100
        `).all();
    },

    getSystemMetrics: ({ user, set }: any) => {
        if (!user || user.role !== 'admin') {
            set.status = 403;
            return { error: "Forbidden" };
        }

        const memory = process.memoryUsage();
        const dbSize = Bun.file("charcoal_project.sqlite").size;

        return {
            uptime: Math.floor(process.uptime()),
            memory: {
                heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
                rss: Math.round(memory.rss / 1024 / 1024)
            },
            database: {
                sizeBytes: dbSize,
                sizeMB: (dbSize / 1024 / 1024).toFixed(2)
            }
        };
    },

    performBackup: async ({ user, set }: any) => {
        if (!user || user.role !== 'admin') {
            set.status = 403;
            return { error: "Forbidden" };
        }

        try {
            const latestBackup = "backup_latest.sqlite";
            const previousBackup = "backup_previous.sqlite";
            const mainDb = "charcoal_project.sqlite";

            // Rotate: move latest to previous if it exists
            const latestFile = Bun.file(latestBackup);
            if (await latestFile.exists()) {
                await Bun.write(previousBackup, latestFile);
            }

            // Save current to latest
            const dbFile = Bun.file(mainDb);
            await Bun.write(latestBackup, dbFile);

            return {
                success: true,
                message: "Backup updated (rotated latest/previous)",
                latest: latestBackup,
                previous: previousBackup
            };
        } catch (e: any) {
            set.status = 500;
            return { error: e.message };
        }
    }
};
