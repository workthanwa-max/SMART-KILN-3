# SMART Project

โปรเจกต์ระบบจัดการข้อมูล (Smart Management) ที่ประกอบด้วย Frontend (React + Vite) และ Backend (Bun + ElysiaJS)

## 🏗️ โครงสร้างโปรเจกต์ (Project Structure)

### 📁 Root Directory
- `frontend/`: โค้ดส่วนหน้าบ้าน (React + Vite)
- `backend/`: โค้ดส่วนหลังบ้าน (Bun + ElysiaJS)
- `docker-compose.yml`: ไฟล์สำหรับควบคุมการรัน Docker ทั้งระบบ
- `README.md`: รายละเอียดโปรเจกต์และการเริ่มใช้งาน

---

### 🔙 Backend Structure (`backend/src/`)
ส่วนหลังบ้านใช้ **ElysiaJS** และ **SQLite** ในการจัดการข้อมูล
- `controllers/`: ส่วนจัดการ Logic หลักของ API (เช่น ระบบล็อกอิน, การจัดการเตา, การบันทึกผลการเผา)
- `routes/`: ส่วนกำหนด Route ของ API แยกตามหมวดหมู่
- `db.ts`: ไฟล์ตั้งค่าฐานข้อมูล SQLite และ Schema ของตารางต่างๆ
- `index.ts`: จุดเริ่มต้นของ Server (Entry Point)

---

### 🎨 Frontend Structure (`frontend/src/`)
ส่วนหน้าบ้านใช้ **React** กับ **Material UI** และรองรับการทำงานแบบ Offline
- `pages/`: หน้าจอต่างๆ ของระบบ โดยแยกตามสิทธิ์การใช้งาน:
    - `Researcher/`: หน้าจอสำหรับนักวิจัย (ดูสรุปผล, จัดการข้อมูล)
    - `Operator/`: หน้าจอสำหรับคนเผาถ่าน (บันทึกข้อมูลหน้าเตา)
- `components/`: UI Components ที่ใช้ซ้ำ เช่น Sidebar, Navbar, Loading Spinner
- `api/`: ส่วนติดต่อกับ Backend ผ่าน Axios
- `db/`: ส่วนจัดการฐานข้อมูลในเครื่อง (IndexedDB ผ่าน Dexie.js) สำหรับโหมด Offline
- `services/`: Service ต่างๆ เช่น ระบบ Sync ข้อมูลระหว่างเครื่องกับ Server
- `theme.ts`: การตั้งค่าสีและดีไซน์ของ Material UI

---

## 🚀 วิธีการเริ่มใช้งาน (Getting Started)

### 🐳 1. รันผ่าน Docker (แนะนำ)
วิธีนี้นิยมที่สุดเพราะไม่ต้องติดตั้ง Bun หรือ Node.js ในเครื่องคอมพิวเตอร์ของคุณ

```bash
docker-compose up --build
```
- **Frontend:** [http://localhost:80](http://localhost:80)
- **Backend:** [http://localhost:3000](http://localhost:3000)

---

### 💻 2. รันแบบ Local สำหรับการพัฒนา (Local Development)

#### Backend (รองรับ Bun)
1. เข้าไปที่โฟลเดอร์ backend: `cd backend`
2. ติดตั้ง dependencies: `bun install`
3. รันโปรเจกต์: `bun run index.ts`

#### Frontend
1. เข้าไปที่โฟลเดอร์ frontend: `cd frontend`
2. ติดตั้ง dependencies: `npm install` หรือ `bun install`
3. รันโปรเจกต์: `npm run dev` หรือ `bun run dev`
4. เข้าใช้งานได้ที่: `http://localhost:5173`

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend
- **React 19**
- **Vite**
- **Material UI (MUI)**
- **Capacitor** (สำหรับทำ Mobile App)
- **Dexie.js** (IndexedDB สำหรับเก็บข้อมูล offline)

### Backend
- **Bun Runtime** (ความเร็วสูง)
- **ElysiaJS** (Web Framework ที่รวดเร็ว)
- **SQLite** (ฐานข้อมูลเบื้องต้น)

---

## 📝 บันทึกเพิ่มเติม
- ตรวจสอบไฟล์ `.env` ในแต่ละโฟลเดอร์ (ถ้ามี) เพื่อตั้งค่า Environment Variables
- ในส่วนของ Frontend มีการใช้ Capacitor ซึ่งสามารถ Build เป็น App Android/iOS ได้

---

---

## 👥 บทบาทการใช้งาน (Role-based Workflows)

### 1. 🔬 นักวิจัย (Researcher)
**บทบาท:** ผู้ดูแลระบบและวิเคราะห์ผลข้อมูล
- **Management:** จัดการข้อมูลผู้ใช้งาน (พนักงานเผาถ่าน), ข้อมูลเตาเผา และการมอบหมายเตาให้พนักงานดูแล
- **Monitoring:** ดูรายการบันทึกการเผาถ่านทั้งหมด (Master List) และสถิติภาพรวมผ่าน Dashboard
- **Reporting:** ออกรายงานสรุปผลการดำเนินงานประจำปี (Annual Report)

### 2. 🔥 คนเผาถ่าน (Operator)
**บทบาท:** ผู้ปฏิบัติงานหน้าเตา บันทึกข้อมูลแบบ Real-time
- **Start Burn:** บันทึกการเริ่มต้นเผา โดยเลือกเตา, ชนิดไม้, ปริมาณ และความชื้นเริ่มต้น
- **Finish Burn:** บันทึกการจบการเผา โดยระบุชั่วโมงที่ใช้, น้ำหนักถ่านที่ได้, จำนวนกระสอบ และคุณภาพถ่าน
- **History:** ตรวจสอบประวัติการทำงานของตนเองย้อนหลัง

---

## 🏗️ เทคนิกเบื้องหลัง (Technical Concepts)

### 📱 Local-first & Offline Support
ระบบนี้ถูกออกแบบให้ทำงานได้แม้ไม่มีอินเทอร์เน็ต (Local-first) โดยใช้:
- **Dexie.js (IndexedDB):** ฐานข้อมูลภายในเครื่องที่เก็บข้อมูลทั้งหมดไว้ก่อน ทำให้แอปทำงานได้รวดเร็วและใช้งานแบบ Offline ได้ 100%
- **Capacitor Network:** ตรวจจับสถานะการเชื่อมต่ออินเทอร์เน็ตแบบ Real-time

### 🔄 ระบบซิงค์ข้อมูล (Sync Mechanism)
- ข้อมูลที่บันทึกขณะออฟไลน์จะถูกติดสถานะ `pending`
- เมื่อระบบตรวจพบอินเทอร์เน็ต จะทำการ **Auto-Sync** ข้อมูลขึ้น Server หลังบ้านทันที
- มีการทำ **Background Pull** เพื่อดึงข้อมูลล่าสุดจากผู้อื่นมาไว้ในเครื่องเสมอ

### 📦 Hybrid Mobile App (Capacitor)
- ใช้ **Capacitor** ในการห่อหุ้มหน้าเว็บ (React) ให้เป็นแอปมือถือ
- รองรับการเข้าถึงฟีเจอร์ของเครื่อง เช่น **GPS** สำหรับระบุตำแหน่งเตาเผา และการจัดการระบบเครือข่ายที่เสถียร

---

## 📲 การดาวน์โหลดและติดตั้ง (Installation)

ระบบ SMART ถูกออกแบบให้เป็นแอปพลิเคชันที่ติดตั้งลงในมือถือได้เพื่อความสะดวกในการใช้งานหน้าเตา:
1.  **Android (.apk):** สามารถ Build โค้ดในโฟลเดอร์ `frontend` ผ่าน Android Studio เพื่อรันเป็นไฟล์ติดตั้งได้โดยตรง
2.  **Web App:** สามารถเข้าใช้งานผ่าน Browser ในมือถือและเลือก "Add to Home Screen" เพื่อใช้งานเสมือนแอปทั่วไป

## 📵 การใช้งานแบบออฟไลน์ (Offline Operation)

คุณสามารถใช้งานระบบได้แม้ไม่มีสัญญาณอินเทอร์เน็ตในพื้นที่:
- **หน้าเตาถ่าน:** พนักงานสามารถถือมือถือไปเปิดแอปบันทึก "เริ่มเผา" หรือ "จบการเผา" ได้ปกติ ข้อมูลจะถูกเก็บลงในเครื่องทันที
- **การเชื่อมต่อจะกลับมาอัตโนมัติ:** เมื่อพนักงานเดินกลับมาในจุดที่มี WiFi หรือ 4G ระบบจะทำการซิงค์ (Sync) ข้อมูลที่ค้างอยู่ในเครื่องขึ้น Server ให้เองโดยไม่ต้องกดส่งซ้ำ
- **ความปลอดภัยของข้อมูล:** ข้อมูลในเครื่องจะไม่หายแม้ปิดแอปหรือปิดเครื่อง เพราะเราใช้ระบบฐานข้อมูล IndexedDB ที่มีความคงทนสูง

---

# English Version (Quick Start)

### Run with Docker
```bash
docker-compose up --build
```

### Local Development
- **Backend:** `cd backend && bun install && bun run src/index.ts`
- **Frontend:** `cd frontend && npm install && npm run dev`


