import db from '../db';

export const DashboardController = {
    getStats: ({ user, set }: any) => {
        // user ถูกส่งมาจาก derive ใน index.ts
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        // --- สำหรับนักวิจัย (Researcher: View All) ---
        if (user.role === 'researcher') {
            const totalExperiments = db.query("SELECT COUNT(*) as count FROM experiments").get() as any;
            const totalWeight = db.query("SELECT SUM(charcoal_weight) as total FROM experiments").get() as any;
            const totalUsers = db.query("SELECT COUNT(*) as count FROM users WHERE role = 'operator'").get() as any;

            // ข้อมูลเตา: ทั้งหมด, กำลังใช้งาน (มี Exp ที่ยังไม่เสร็จ), ว่าง
            const kilnStats = db.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
                    (SELECT COUNT(DISTINCT kiln_id) FROM experiments WHERE charcoal_weight IS NULL) as in_use
                FROM kilns
            `).get() as any;

            // สถิติแยกตามเกรด
            const gradeStats = db.query(`
                SELECT quality_grade as grade, COUNT(*) as count 
                FROM experiments 
                WHERE quality_grade IS NOT NULL 
                GROUP BY quality_grade
            `).all();

            // รายการเผาล่าสุด 5 รายการ
            const recent = db.query(`
                SELECT e.*, u.name as operator_name, k.name as kiln_name,
                       (SELECT SUM(quantity) FROM experiment_materials WHERE experiment_id = e.experiment_id) as total_wood_weight
                FROM experiments e
                JOIN users u ON e.operator_id = u.user_id
                JOIN kilns k ON e.kiln_id = k.kiln_id
                ORDER BY e.created_at DESC LIMIT 5
            `).all() as any[];

            const recentExperiments = recent.map(e => ({
                ...e,
                yield_percent: e.charcoal_weight && e.total_wood_weight ? (e.charcoal_weight / e.total_wood_weight) * 100 : 0
            }));

            return {
                role: 'researcher',
                overview: {
                    total_experiments: totalExperiments.count,
                    total_charcoal_weight: totalWeight.total || 0,
                    active_kilns: kilnStats.active,
                    in_use_kilns: kilnStats.in_use || 0,
                    operator_count: totalUsers.count
                },
                grade_distribution: gradeStats,
                recent_experiments: recentExperiments
            };
        }


        // --- สำหรับคนเผา (Operator: View Self Only) ---
        if (user.role === 'operator') {
            const myStats = db.query(`
                SELECT 
                    COUNT(*) as total_runs,
                    SUM(burn_hours) as total_hours,
                    SUM(charcoal_weight) as total_weight
                FROM experiments 
                WHERE operator_id = ?
            `).get(user.id) as any;

            const myKilns = db.query(`
                SELECT k.kiln_id, k.name, k.location 
                FROM kilns k
                JOIN user_kilns uk ON k.kiln_id = uk.kiln_id
                WHERE uk.user_id = ? AND k.is_active = 1
            `).all(user.id);

            const recent = db.query(`
                SELECT e.experiment_id, e.created_at, e.quality_grade, e.charcoal_weight, k.name as kiln_name,
                       (SELECT SUM(quantity) FROM experiment_materials WHERE experiment_id = e.experiment_id) as total_wood_weight
                FROM experiments e
                JOIN kilns k ON e.kiln_id = k.kiln_id
                WHERE e.operator_id = ?
                ORDER BY e.created_at DESC LIMIT 5
            `).all(user.id) as any[];

            const recentActivities = recent.map(e => ({
                ...e,
                yield_percent: e.charcoal_weight && e.total_wood_weight ? (e.charcoal_weight / e.total_wood_weight) * 100 : 0
            }));

            return {
                role: 'operator',
                my_summary: {
                    runs: myStats.total_runs || 0,
                    hours: myStats.total_hours || 0,
                    weight: myStats.total_weight || 0
                },
                assigned_kilns: myKilns,
                recent_activities: recentActivities
            };
        }

        set.status = 403;
        return { error: "Role not recognized" };
    },

    getAnnualReport: ({ user, query, set }: any) => {
        if (!user || user.role !== 'researcher') {
            set.status = 403;
            return { error: 'Unauthorized or Forbidden' };
        }

        const year = query.year || new Date().getFullYear().toString();

        // 1. Monthly aggregated data
        const monthlyData = db.query(`
            SELECT 
                strftime('%m', created_at) as month,
                COUNT(*) as experiments,
                SUM(CASE WHEN charcoal_weight IS NOT NULL THEN charcoal_weight ELSE 0 END) as total_weight,
                SUM(CASE WHEN burn_hours IS NOT NULL THEN burn_hours ELSE 0 END) as total_hours
            FROM experiments
            WHERE strftime('%Y', created_at) = ?
            GROUP BY month
            ORDER BY month ASC
        `).all(year) as any[];

        // 2. Yearly Total and Carbon Credit Estimate
        const yearlyStats = db.query(`
            SELECT 
                COUNT(*) as total_experiments,
                SUM(CASE WHEN charcoal_weight IS NOT NULL THEN charcoal_weight ELSE 0 END) as total_weight,
                SUM(CASE WHEN burn_hours IS NOT NULL THEN burn_hours ELSE 0 END) as total_hours
            FROM experiments
            WHERE strftime('%Y', created_at) = ?
        `).get(year) as any;

        // 3. Wood types distribution for the year
        const woodStats = db.query(`
            SELECT wood_type, SUM(quantity) as total_quantity
            FROM experiment_materials em
            JOIN experiments e ON em.experiment_id = e.experiment_id
            WHERE strftime('%Y', e.created_at) = ?
            GROUP BY wood_type
            ORDER BY total_quantity DESC
        `).all(year);

        const CO2_FACTOR = 2.5; // kg CO2 per 1 kg charcoal
        const totalWeight = yearlyStats.total_weight || 0;
        const carbonCredits = (totalWeight * CO2_FACTOR) / 1000;

        // Format monthly data for chart (ensure all 12 months are present)
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const chartData = months.map((m, i) => {
            const found = monthlyData.find(d => parseInt(d.month) === i + 1);
            return {
                label: m,
                weight: found ? found.total_weight : 0,
                experiments: found ? found.experiments : 0,
                carbon: found ? (found.total_weight * CO2_FACTOR) / 1000 : 0
            };
        });

        return {
            year,
            summary: {
                experiments: yearlyStats.total_experiments || 0,
                total_weight: totalWeight,
                total_hours: yearlyStats.total_hours || 0,
                carbon_credits: carbonCredits
            },
            monthly_chart: chartData,
            wood_usage: woodStats
        };
    }
};