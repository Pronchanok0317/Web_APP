# Lab 12 — ร้านอาหารสัตตบุษย์

ต่อยอดเว็บ Lab 11 เดิม ย้ายหน้า Home / Menu / Order เป็น React components โดยคงโครงสร้างหน้า CSS สี รูปอาหาร ข้อความ และระบบสั่งอาหารเดิมไว้ แยก frontend / backend แบบโปรเจกต์เพื่อน

```text
lab12/
  frontend/             React + Vite
    src/                Home, Menu, Order, Account, Users, Nav
    public/images/      รูปเดิมจาก Lab11
  backend/              Express + Prisma + MySQL
    src/                API, JWT, Prisma client
    prisma/             schema.prisma
    scripts/            เพิ่มตารางสมาชิกและเตรียมบัญชีผู้ดูแล
    test/               integration tests
```

## เริ่มใช้งานกับฐานข้อมูล Lab 11 เดิม

1. เปิด MySQL ของ XAMPP ให้ฐานข้อมูล `restaurant_db` จาก Lab 11 ใช้งานได้
2. รัน `npm run install:all` ที่โฟลเดอร์ `lab12`
3. คัดลอก `backend/.env.example` เป็น `backend/.env` หากยังไม่มี และตั้ง `DATABASE_URL` ให้ตรงกับ MySQL ของคุณ
4. รัน `npm run setup` เพิ่มเฉพาะตาราง `users`, `ratings`, สร้าง Prisma client และสร้างบัญชีผู้ดูแลเมื่อยังไม่มี ไม่ลบหรือสร้างตารางเมนู/ออร์เดอร์เดิมใหม่
5. รัน `npm run build` แล้ว `npm start`
6. เปิด <http://127.0.0.1:5012>

Admin สำหรับแลบ: `admin` / `Admin12345!` (หรือตั้ง `ADMIN_PASSWORD` ก่อน setup ครั้งแรก)
User สมัครเองที่ `/register` บัญชีใหม่เป็น `user` เสมอ

## โหมดพัฒนา แยกสอง terminal แบบตัวอย่างเพื่อน

```powershell
# Terminal 1 ที่ lab12
npm run dev

# Terminal 2 ที่ lab12
npm run dev:frontend
```

เปิด <http://127.0.0.1:5173> Vite proxy ส่ง `/api` ไป backend พอร์ต 5012 ใช้ URL เดียวกันทั้ง development และ production

## ฟังก์ชันตาม TODO

- Guest ดูเมนู Best Seller และคะแนนเฉลี่ย, Login / Register
- User ให้คะแนน 1–5 ดาว แก้คะแนนเดิม สั่งอาหาร และ Logout
- Admin เพิ่ม/แก้ไข/ลบเมนู เปลี่ยนสิทธิ์ผู้ใช้ และ Logout
- React โหลดเมนู คะแนน และสถานะผู้ใช้ใหม่ทุก 5 วินาที พร้อมล้าง interval เมื่อออกจากหน้า
- bcrypt เก็บรหัสผ่านเป็น hash; JWT อายุ 1 ชั่วโมง ตรวจสิทธิ์ปัจจุบันด้วย Prisma ทุกคำขอ
- Prisma ใช้ตารางเดิม `types`, `menus`, `orders`, `order_items` และตารางที่เพิ่ม `users`, `ratings`

`restaurant_db_lab12_auth.sql` เป็น migration ที่เพิ่มจาก Lab11 เท่านั้น อย่ารัน `restaurant_db_lab11.sql` ซ้ำบนฐานข้อมูลเดิม เพราะไฟล์เดิมมี DROP TABLE

## ทดสอบ

`npm test` ใช้ MySQL ทดสอบที่พอร์ต 3313 (เปลี่ยนด้วย `TEST_DB_PORT`, `TEST_DB_USER`, `TEST_DB_PASSWORD`) และสร้างฐานข้อมูล `lab12_test_<timestamp>` แยกจากฐานข้อมูลเรียนจริง ทดสอบสมัครซ้ำ การ hash รหัสผ่าน JWT หมดอายุ สิทธิ์ API การเปลี่ยน role คะแนน เมนู และออร์เดอร์ผ่าน Prisma

## สถานะเครื่องขณะตรวจงาน

Build, integration tests ผ่าน Prisma และการตรวจหน้าเว็บในเบราว์เซอร์ผ่านแล้ว พรีวิวที่เปิดไว้ใช้ฐานข้อมูลทดสอบแยกพอร์ต 3313 เพราะ MySQL ของ XAMPP เดิมพอร์ต 3306 เปิดไม่สำเร็จ โดยรายงานว่า `mysql.db` มี index เสีย ต้องแก้ปัญหา MySQL เดิมก่อนใช้ `restaurant_db` จริง การตั้งค่าใน `backend/.env` ยังคงชี้ฐานข้อมูลเดิม ไม่ได้สลับเป็นฐานทดสอบ
