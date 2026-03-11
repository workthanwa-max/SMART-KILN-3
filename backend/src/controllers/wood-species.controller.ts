import { WoodSpeciesService } from '../services/wood-species.service';
import { ResponseUtil } from '../utils/response';

export const WoodSpeciesController = {
    // 1. ดึงรายการพันธุ์ไม้ทั้งหมด
    getAll: ({ query }: any) => {
        const activeOnly = query.active_only === 'true';
        const data = WoodSpeciesService.getAll(activeOnly);
        return ResponseUtil.success(data);
    },

    // 2. เพิ่มพันธุ์ไม้ใหม่
    create: ({ body, set }: any) => {
        try {
            const { name } = body;
            const id = WoodSpeciesService.create(name);
            return ResponseUtil.success({ species_id: id }, "เพิ่มพันธุ์ไม้สำเร็จ");
        } catch (e: any) {
            set.status = 400;
            if (e.message.includes("UNIQUE constraint failed")) {
                return ResponseUtil.error("มีชื่อพันธุ์ไม้นี้อยู่ในระบบแล้ว", "DUPLICATE_NAME");
            }
            return ResponseUtil.error(e.message);
        }
    },

    // 3. แก้ไขชื่อพันธุ์ไม้
    update: ({ params, body, set }: any) => {
        try {
            const { name } = body;
            const success = WoodSpeciesService.update(params.id, name);
            if (!success) {
                set.status = 404;
                return ResponseUtil.error("ไม่พบข้อมูลพันธุ์ไม้", "NOT_FOUND");
            }
            return ResponseUtil.success(null, "แก้ไขข้อมูลสำเร็จ");
        } catch (e: any) {
            set.status = 400;
            if (e.message.includes("UNIQUE constraint failed")) {
                return ResponseUtil.error("มีชื่อพันธุ์ไม้นี้อยู่ในระบบแล้ว", "DUPLICATE_NAME");
            }
            return ResponseUtil.error(e.message);
        }
    },

    // 4. เปิด/ปิดการใช้งาน
    toggleActive: ({ params, body, set }: any) => {
        const { is_active } = body;
        const success = WoodSpeciesService.toggleActive(params.id, is_active);
        if (!success) {
            set.status = 404;
            return ResponseUtil.error("ไม่พบข้อมูลพันธุ์ไม้", "NOT_FOUND");
        }
        return ResponseUtil.success(null, `เปลี่ยนสถานะเป็น${is_active ? 'เปิด' : 'ปิด'}การใช้งานสำเร็จ`);
    },

    // 5. ลบพันธุ์ไม้
    delete: ({ params, set }: any) => {
        const result = WoodSpeciesService.delete(params.id);

        if (!result.success) {
            if (result.error === "NOT_FOUND") {
                set.status = 404;
                return ResponseUtil.error("ไม่พบข้อมูลพันธุ์ไม้", "NOT_FOUND");
            }
            if (result.error === "USED") {
                set.status = 400;
                return ResponseUtil.error("ไม่สามารถลบได้เนื่องจากพันธุ์ไม้นี้ถูกใช้งานในรายงานการทดลองแล้ว แนะนำให้ใช้การ 'ปิดการใช้งาน' แทน", "RESOURCE_USED");
            }
        }

        return ResponseUtil.success(null, "ลบข้อมูลสำเร็จ");
    }
};
