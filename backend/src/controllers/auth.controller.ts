import db from '../db';

export const AuthController = {
    login: async ({ body, jwt, set }: any) => {
        const { phone, password } = body;
        try {
            const user = db.query("SELECT * FROM users WHERE phone = ?").get(phone) as any;
            if (!user) {
                set.status = 404;
                return { error: "ไม่พบผู้ใช้งานนี้ในระบบ" };
            }

            if (user.is_active === 0) {
                set.status = 403;
                return { error: "บัญชีนี้ถูกปิดใช้งานแล้ว" };
            }

            // Verify password
            const isMatch = await Bun.password.verify(password, user.password);
            if (!isMatch) {
                set.status = 401;
                return { error: "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง" };
            }

            const token = await jwt.sign({ id: user.user_id, role: user.role });

            return {
                success: true,
                token,
                user: {
                    id: user.user_id,
                    name: user.name,
                    role: user.role,
                    must_change_password: user.must_change_password === 1
                }
            };
        } catch (e: any) {
            set.status = 500;
            return { error: e.message };
        }
    },

    updatePassword: async ({ body, user, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const { newPassword } = body;
        try {
            const hashedPassword = await Bun.password.hash(newPassword);
            db.prepare("UPDATE users SET password = ?, must_change_password = 0 WHERE user_id = ?")
                .run(hashedPassword, user.id);

            return { success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" };
        } catch (e: any) {
            set.status = 500;
            return { error: e.message };
        }
    },



    getMe: ({ user, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const userData = db.query("SELECT user_id as id, name, phone, role, must_change_password FROM users WHERE user_id = ?")
            .get(user.id) as any;

        if (!userData) {
            set.status = 404;
            return { error: "User not found" };
        }

        return {
            ...userData,
            must_change_password: userData.must_change_password === 1
        };
    }
};