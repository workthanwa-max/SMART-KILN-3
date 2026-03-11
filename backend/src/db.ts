// src/db.ts
import { Database } from "bun:sqlite";

const db = new Database("charcoal_project.sqlite", { create: true });
db.run("PRAGMA foreign_keys = ON;");

const initDb = () => {
    // 1. ตารางผู้ใช้
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL UNIQUE,
            password TEXT,
            role TEXT NOT NULL CHECK (role IN ('researcher','operator','admin')),
            must_change_password INTEGER DEFAULT 1,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. ตารางเตาเผา
    db.run(`
        CREATE TABLE IF NOT EXISTS kilns (
            kiln_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT,
            latitude TEXT,
            longitude TEXT,
            note TEXT,
            is_active INTEGER DEFAULT 1
        );
    `);

    // 3. ตารางความสัมพันธ์ (User <-> เตา)
    db.run(`
        CREATE TABLE IF NOT EXISTS user_kilns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            kiln_id INTEGER NOT NULL,
            UNIQUE (user_id, kiln_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (kiln_id) REFERENCES kilns(kiln_id) ON DELETE CASCADE
        );
    `);

    // 4. ตารางการทดลอง
    db.run(`
        CREATE TABLE IF NOT EXISTS experiments (
            experiment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            operator_id INTEGER NOT NULL,
            kiln_id INTEGER NOT NULL,
            burn_hours REAL NOT NULL,
            charcoal_weight REAL,
            bag_count INTEGER,
            quality_grade TEXT,
            initial_moisture TEXT,
            final_moisture TEXT,
            summary_note TEXT,
            wood_vinegar_quantity REAL,
            temperature REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (operator_id) REFERENCES users(user_id),
            FOREIGN KEY (kiln_id) REFERENCES kilns(kiln_id)
        );
    `);

    // 5. ตารางวัตถุดิบ
    db.run(`
        CREATE TABLE IF NOT EXISTS experiment_materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            experiment_id INTEGER NOT NULL,
            wood_type TEXT NOT NULL,
            quantity REAL,
            condition TEXT CHECK (condition IN ('dry','fresh')),
            FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id) ON DELETE CASCADE
        );
    `);

    // 6. ตาราง OTP (อาจจะไม่ใช้แล้วแต่เก็บไว้ก่อนเพื่อความปลอดภัยย้อนกลับ)
    db.run(`
        CREATE TABLE IF NOT EXISTS otp_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL,
            code TEXT NOT NULL,
            expires_at DATETIME NOT NULL
        );
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);`);

    // 7. ตารางประวัติการใช้งาน (Activity Logs)
    db.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            target TEXT,
            detail TEXT,
            ip TEXT,
            user_agent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
        );
    `);

    // 8. ตารางประวัติข้อผิดพลาด (Error Logs)
    db.run(`
        CREATE TABLE IF NOT EXISTS error_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            error_message TEXT NOT NULL,
            stack_trace TEXT,
            endpoint TEXT,
            method TEXT,
            user_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
        );
    `);

    // 9. ตารางการตั้งค่าระบบ (System Settings)
    db.run(`
        CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            description TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Insert Default Settings
    db.run("INSERT OR IGNORE INTO system_settings (key, value, description) VALUES ('maintenance_mode', 'false', 'ปิดปรับปรุงระบบ')");
    db.run("INSERT OR IGNORE INTO system_settings (key, value, description) VALUES ('system_name', 'Smart Charcoal System', 'ชื่อระบบ')");

    // 10. ตารางพันธุ์ไม้ (Wood Species)
    db.run(`
        CREATE TABLE IF NOT EXISTS wood_species (
            species_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // ตรวจสอบและเพิ่มคอลัมน์ใหม่ถ้ายังไม่มี (Migration แบบง่าย)
    try {
        db.run("ALTER TABLE users ADD COLUMN password TEXT;");
    } catch (e) { }
    try {
        db.run("ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 1;");
    } catch (e) { }
    try {
        db.run("ALTER TABLE kilns ADD COLUMN latitude REAL;");
    } catch (e) { }
    try {
        db.run("ALTER TABLE kilns ADD COLUMN longitude REAL;");
    } catch (e) { }

    // Migration: Remove quality_grade CHECK constraint by recreating the table
    try {
        const schema = db.query("SELECT sql FROM sqlite_master WHERE name='experiments'").get() as any;
        if (schema && schema.sql.toLowerCase().includes("check")) {
            console.log("🔧 Removing CHECK constraint from experiments table (Migration)...");
            db.run("PRAGMA foreign_keys = OFF;");
            db.run("BEGIN TRANSACTION;");
            db.run("ALTER TABLE experiments RENAME TO experiments_old;");
            db.run(`
                CREATE TABLE experiments (
                    experiment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    operator_id INTEGER NOT NULL,
                    kiln_id INTEGER NOT NULL,
                    burn_hours REAL NOT NULL,
                    charcoal_weight REAL,
                    bag_count INTEGER,
                    quality_grade TEXT,
                    initial_moisture TEXT,
                    final_moisture TEXT,
                    summary_note TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (operator_id) REFERENCES users(user_id),
                    FOREIGN KEY (kiln_id) REFERENCES kilns(kiln_id)
                );
            `);

            // Try to copy data, mapping old column names if they exist
            db.run(`
                INSERT INTO experiments (
                    experiment_id, operator_id, kiln_id, burn_hours, 
                    charcoal_weight, bag_count, quality_grade, summary_note, created_at
                ) 
                SELECT 
                    experiment_id, operator_id, kiln_id, burn_hours, 
                    charcoal_weight, bag_count, quality_grade, summary_note, created_at 
                FROM experiments_old;
            `);

            db.run("DROP TABLE experiments_old;");
            db.run("COMMIT;");
            db.run("PRAGMA foreign_keys = ON;");
            console.log("✅ CHECK constraint removed successfully via Table Recreation.");
        }
    } catch (e) {
        db.run("ROLLBACK;");
        db.run("PRAGMA foreign_keys = ON;");
        console.error("Migration recreate error:", e);
    }

    try {
        db.run("ALTER TABLE experiments ADD COLUMN initial_moisture TEXT;");
    } catch (e) { }
    try {
        db.run("ALTER TABLE experiments ADD COLUMN final_moisture TEXT;");
    } catch (e) { }
    try {
        db.run("ALTER TABLE experiments ADD COLUMN wood_vinegar_quantity REAL;");
    } catch (e) { }
    try {
        db.run("ALTER TABLE experiments ADD COLUMN temperature REAL;");
    } catch (e) { }

    // Update existing labels
    try {
        db.run("UPDATE experiments SET quality_grade = 'ดี' WHERE quality_grade = 'A';");
        db.run("UPDATE experiments SET quality_grade = 'พอใช้' WHERE quality_grade = 'B';");
        db.run("UPDATE experiments SET quality_grade = 'แย่' WHERE quality_grade = 'C';");
        // Convert old numeric moisture (0) to local terms
        db.run("UPDATE experiments SET initial_moisture = 'ไม้สด' WHERE initial_moisture = '0' OR initial_moisture = 0;");
        db.run("UPDATE experiments SET final_moisture = 'แห้งสนิท' WHERE final_moisture = '0' OR final_moisture = 0;");
    } catch (e) { }

    // Migration: Change latitude/longitude to TEXT for precision
    try {
        const kilnSchema = db.query("SELECT sql FROM sqlite_master WHERE name='kilns'").get() as any;
        if (kilnSchema && kilnSchema.sql.toUpperCase().includes("REAL")) {
            console.log("🔧 Migrating kilns coordinates to TEXT...");
            db.run("PRAGMA foreign_keys = OFF;");
            db.run("BEGIN TRANSACTION;");
            db.run("ALTER TABLE kilns RENAME TO kilns_old;");

            db.run(`
                CREATE TABLE kilns (
                    kiln_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    location TEXT,
                    latitude TEXT,
                    longitude TEXT,
                    note TEXT,
                    is_active INTEGER DEFAULT 1
                );
            `);

            db.run(`
                INSERT INTO kilns (kiln_id, name, location, latitude, longitude, note, is_active)
                SELECT kiln_id, name, location, CAST(latitude AS TEXT), CAST(longitude AS TEXT), note, is_active
                FROM kilns_old;
            `);

            db.run("DROP TABLE kilns_old;");
            db.run("COMMIT;");
            db.run("PRAGMA foreign_keys = ON;");
            console.log("✅ Kilns coordinates migrated to TEXT successfully.");
        }
    } catch (e) {
        db.run("ROLLBACK;");
        db.run("PRAGMA foreign_keys = ON;");
        console.error("Migration kilns error:", e);

    };

    // Migration: Fix broken FKs in experiment_materials pointing to experiments_flawed
    try {
        const matSchema = db.query("SELECT sql FROM sqlite_master WHERE name='experiment_materials'").get() as any;
        if (matSchema && matSchema.sql.includes("experiments_flawed")) {
            console.log("🔧 Fixing broken FKs in experiment_materials...");
            db.run("PRAGMA foreign_keys = OFF;");
            db.run("BEGIN TRANSACTION;");
            db.run("ALTER TABLE experiment_materials RENAME TO experiment_materials_flawed;");
            db.run(`
                CREATE TABLE experiment_materials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    experiment_id INTEGER NOT NULL,
                    wood_type TEXT NOT NULL,
                    quantity REAL,
                    condition TEXT CHECK (condition IN ('dry','fresh')),
                    FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id) ON DELETE CASCADE
                );
            `);
            db.run("INSERT INTO experiment_materials SELECT * FROM experiment_materials_flawed;");
            db.run("DROP TABLE experiment_materials_flawed;");
            db.run("COMMIT;");
            db.run("PRAGMA foreign_keys = ON;");
            console.log("✅ Fixed experiment_materials foreign keys.");
        }
    } catch (e) {
        db.run("ROLLBACK;");
        db.run("PRAGMA foreign_keys = ON;");
        console.error("Fix experiment_materials FK error:", e);
    }
    // Migration: Add 'admin' role to users CHECK constraint if not present
    try {
        const usersSchema = db.query("SELECT sql FROM sqlite_master WHERE name='users'").get() as any;
        if (usersSchema && !usersSchema.sql.includes("'admin'")) {
            console.log("🔧 Migrating users table to include 'admin' role...");
            db.run("PRAGMA foreign_keys = OFF;");
            db.run("BEGIN TRANSACTION;");
            db.run("ALTER TABLE users RENAME TO users_old;");
            db.run(`
                CREATE TABLE users (
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    phone TEXT NOT NULL UNIQUE,
                    password TEXT,
                    role TEXT NOT NULL CHECK (role IN ('researcher','operator','admin')),
                    must_change_password INTEGER DEFAULT 1,
                    is_active INTEGER DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);
            db.run("INSERT INTO users SELECT * FROM users_old;");
            db.run("DROP TABLE users_old;");
            db.run("COMMIT;");
            db.run("PRAGMA foreign_keys = ON;");
            console.log("✅ Users table migrated to include 'admin' role.");
        }
    } catch (e) {
        db.run("ROLLBACK;");
        db.run("PRAGMA foreign_keys = ON;");
        console.error("Migration admin role error:", e);
    }
};



initDb();

export default db;