import db from '../db';

/**
 * Seed initial accounts for deployment.
 * This script should be run manually during deployment or when setting up a new environment.
 */
const seedInitialAccounts = async () => {
    console.log("🌱 Starting safe database seeding...");

    // Check if admin already exists to avoid duplicate seeding
    const adminExists = db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };

    if (adminExists.count > 0) {
        console.log("⚠️ Database already contains admin accounts. Skipping seed to prevent overwriting.");
        process.exit(0);
    }

    try {
        // Retrieve passwords from environment variables or use safe defaults
        const adminPass = process.env.SEED_ADMIN_PASSWORD || "admin@880329";
        const resPass = process.env.SEED_RESEARCHER_PASSWORD || "res@880329";

        console.log("🔑 Hashing passwords...");
        const hashedAdmin = await Bun.password.hash(adminPass);
        const hashedRes = await Bun.password.hash(resPass);

        console.log("👤 Creating Admin account...");
        db.prepare(`
            INSERT INTO users (name, phone, role, password, must_change_password) 
            VALUES (?, ?, ?, ?, ?)
        `).run("System Administrator", "0000000000", "admin", hashedAdmin, 1);

        console.log("👤 Creating Researcher account...");
        db.prepare(`
            INSERT INTO users (name, phone, role, password, must_change_password) 
            VALUES (?, ?, ?, ?, ?)
        `).run("Default Researcher", "1111111111", "researcher", hashedRes, 1);

        console.log("✅ Seeding completed successfully.");
        console.log("-----------------------------------------");
        console.log("Initial Credentials:");
        console.log("Admin: 0000000000 / " + (process.env.SEED_ADMIN_PASSWORD ? "********" : "admin@880329"));
        console.log("Researcher: 1111111111 / " + (process.env.SEED_RESEARCHER_PASSWORD ? "********" : "res@880329"));
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedInitialAccounts();
