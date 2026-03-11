import { KilnService } from '../services/kiln.service';
import { ResponseUtil } from '../utils/response';

export const KilnController = {
    getAll: () => {
        const data = KilnService.getAll();
        return ResponseUtil.success(data);
    },

    create: ({ body, user, set }: any) => {
        if (!user || user.role !== 'researcher') {
            set.status = 403;
            return ResponseUtil.error("คุณไม่มีสิทธิ์เข้าถึงส่วนนี้", "FORBIDDEN");
        }

        try {
            const id = KilnService.create(body);
            return ResponseUtil.success({ kiln_id: id }, "สร้างข้อมูลเตาเผาสำเร็จ");
        } catch (error: any) {
            set.status = 500;
            return ResponseUtil.error(error.message);
        }
    },

    update: ({ params, body, user, set }: any) => {
        if (!user || user.role !== 'researcher') {
            set.status = 403;
            return ResponseUtil.error("คุณไม่มีสิทธิ์เข้าถึงส่วนนี้", "FORBIDDEN");
        }

        try {
            const success = KilnService.update(params.id, body);
            if (!success) {
                set.status = 404;
                return ResponseUtil.error("ไม่พบข้อมูลเตาเผาที่ต้องการแก้ไข", "NOT_FOUND");
            }
            return ResponseUtil.success(null, "อัปเดตข้อมูลเตาเผาสำเร็จ");
        } catch (error: any) {
            set.status = 500;
            return ResponseUtil.error(error.message);
        }
    },

    toggleActive: ({ params, body, user, set }: any) => {
        if (!user || user.role !== 'researcher') {
            set.status = 403;
            return ResponseUtil.error("คุณไม่มีสิทธิ์เข้าถึงส่วนนี้", "FORBIDDEN");
        }

        const success = KilnService.toggleActive(params.id, body.is_active);
        if (!success) {
            set.status = 404;
            return ResponseUtil.error("ไม่พบข้อมูลเตาเผา", "NOT_FOUND");
        }
        return ResponseUtil.success(null, `สถานะเตาเผาถูกเปลี่ยนเป็น ${body.is_active ? 'เปิด' : 'ปิด'}การใช้งาน`);
    }
};