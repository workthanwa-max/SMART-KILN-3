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
            role TEXT NOT NULL CHECK (role IN ('researcher','operator')),
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
            latitude REAL,
            longitude REAL,
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
};

const seedData = async () => {
    // Migration: Update existing users without passwords
    const usersWithoutPassword = db.query("SELECT * FROM users WHERE password IS NULL").all() as any[];
    if (usersWithoutPassword.length > 0) {
        console.log(`🔧 กำลังอัปเดตรหัสผ่านเริ่มต้นให้ผู้ใช้ ${usersWithoutPassword.length} ท่าน...`);
        const defaultHash = await Bun.password.hash("123456");
        for (const user of usersWithoutPassword) {
            db.prepare("UPDATE users SET password = ?, must_change_password = 1 WHERE user_id = ?")
                .run(defaultHash, user.user_id);
        }
        console.log("✅ อัปเดตรหัสผ่านเริ่มต้นสำเร็จ (123456)");
    }

    const userCount = db.query("SELECT COUNT(*) as count FROM users").get() as { count: number };


    if (userCount.count === 0) {
        console.log("🌱 เริ่มต้นเพิ่มข้อมูล Seed ทุกตาราง...");

        // --- 1. Users ---
        const hashedAdminPassword = await Bun.password.hash("123456");
        const hashedOperatorPassword = await Bun.password.hash("123456");

        const researcher = db.prepare(`INSERT INTO users (name, phone, role, password, must_change_password) VALUES (?, ?, ?, ?, ?) RETURNING user_id`)
            .get("ดร. วิจัย พัฒนา", "0811111111", "researcher", hashedAdminPassword, 0) as any;

        const operator = db.prepare(`INSERT INTO users (name, phone, role, password, must_change_password) VALUES (?, ?, ?, ?, ?) RETURNING user_id`)
            .get("นายมานะ ขยันเผา", "0822222222", "operator", hashedOperatorPassword, 1) as any;

        // --- 2. Kilns ---
        const kiln1 = db.prepare(`INSERT INTO kilns (name, location, note) VALUES (?, ?, ?) RETURNING kiln_id`)
            .get("เตาประสิทธิภาพสูง 01", "โรงเรือนทิศเหนือ", "เซ็นเซอร์ครบชุด") as any;

        const kiln2 = db.prepare(`INSERT INTO kilns (name, location, note) VALUES (?, ?, ?) RETURNING kiln_id`)
            .get("เตาประหยัดพลังงาน 02", "โรงเรือนทิศใต้", "เตาดินปั้น") as any;

        // --- 3. User Kilns (ผูกคนเผากับเตา) ---
        db.prepare(`INSERT INTO user_kilns (user_id, kiln_id) VALUES (?, ?)`).run(operator.user_id, kiln1.kiln_id);
        db.prepare(`INSERT INTO user_kilns (user_id, kiln_id) VALUES (?, ?)`).run(operator.user_id, kiln2.kiln_id);

        // --- 4. Experiments ---
        const exp1 = db.prepare(`
            INSERT INTO experiments (operator_id, kiln_id, burn_hours, charcoal_weight, bag_count, quality_grade, summary_note) 
            VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING experiment_id
        `).get(operator.user_id, kiln1.kiln_id, 12.5, 45.0, 15, 'ดี', "คุณภาพถ่านดีมาก สีดำเงา") as any;

        const exp2 = db.prepare(`
            INSERT INTO experiments (operator_id, kiln_id, burn_hours, charcoal_weight, bag_count, quality_grade, summary_note) 
            VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING experiment_id
        `).get(operator.user_id, kiln2.kiln_id, 10.0, 30.5, 10, 'พอใช้', "ถ่านบางส่วนยังไม่สุกดี") as any;

        // --- 5. Materials ---
        db.prepare(`INSERT INTO experiment_materials (experiment_id, wood_type, quantity, condition) VALUES (?, ?, ?, ?)`)
            .run(exp1.experiment_id, "ไม้โกงกาง", 100.0, "dry");
        db.prepare(`INSERT INTO experiment_materials (experiment_id, wood_type, quantity, condition) VALUES (?, ?, ?, ?)`)
            .run(exp1.experiment_id, "ไม้เงาะ", 50.0, "dry");

        db.prepare(`INSERT INTO experiment_materials (experiment_id, wood_type, quantity, condition) VALUES (?, ?, ?, ?)`)
            .run(exp2.experiment_id, "ไม้เบญจพรรณ", 120.0, "fresh");

        console.log("✅ Seed ข้อมูลสำเร็จครบทุกความสัมพันธ์!");
    }
};

initDb();
seedData();

export default db;