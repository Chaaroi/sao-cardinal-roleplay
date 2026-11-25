# SAO: Cardinal Omniverse Roleplay

เว็บแอปพลิเคชัน Roleplay จักรวาล **Sword Art Online (SAO)** แบบ Interactive Fiction ที่ขับเคลื่อนด้วย **Gemini API (`@google/genai`)** พร้อม HUD สไตล์ Aincrad, ระบบความสัมพันธ์/แต่งงาน, ย้ายเซฟข้ามภาค, ร้านค้า, อัปเกรด Stat, ทอยลูกเต๋า D20 และดึงข้อมูลจาก SAO Fandom Wiki แบบเรียลไทม์

## ฟีเจอร์หลัก
- **Link Start & World Arcs**: สร้างตัวละคร เลือกอาวุธ และเลือกจุดเริ่มต้น (`Aincrad (Floor 1)`, `Progressive`, `ALfheim Online`, `Gun Gale Online`, `Underworld`, `Gameverse Crossover`)
- **World Arc Save Transfer**: ย้ายเซฟจาก `Aincrad` หรือ `Progressive` ไปเล่นต่อใน `ALfheim Online` โดยคงค่าความสัมพันธ์/คู่สมรสทั้งหมด (และล็อกไม่ให้ข้ามระหว่าง `Aincrad` ↔ `Progressive`)
- **Cardinal System & Streaming AI**: สตรีมคำตอบเรียลไทม์, รองรับ Gemini 4 / 3.x / 2.5 และ Custom Model ID, Auto-Fallback เมื่อเจอ `404`/`503` และมี Offline Demo Mode สำหรับทดลองเล่น
- **SAO Fandom Wiki RAG & Search**: ดึงข้อมูลตัวละคร/ชั้น/อาวุธจริงจาก `swordartonline.fandom.com` แนบให้ AI ทุกเทิร์น พร้อมแท็บค้นหา Wiki ในตัวเกมและรูปโปรไฟล์ตัวละครหน้าชื่อ
- **Relationship, Romance & Marriage**: การ์ดความสัมพันธ์ `-100` ถึง `1000`, ชวนเข้าปาร์ตี้/มอบของขวัญ/ออกเดต, ขอแต่งงานเมื่อ `Affection >= 900` ปลดล็อก **Shared Inventory** และ **Floor 22 Cabin**
- **Event CG Generator**: สุ่มเจนภาพ Event CG ในฉากสำคัญ (ขอแต่งงาน, เดต, เดินเล่น, พักผ่อน) รองรับ Gemini Image API, SD 3.5 Turbo, FLUX.1 Merged และ AI Horde
- **Merchant Shop System**: เปิดหน้าร้านค้าอัตโนมัติเมื่อเข้าร้านในเนื้อเรื่อง แสดงรายละเอียด จำนวนคงเหลือ ราคา `Col` และหักเงินเข้ากระเป๋าอัตโนมัติ
- **Character Stats & 1d20 Dice Check**: อัปเกรด `STR / AGI / INT / VIT / MND / LUK` เมื่อ Level Up (`+5 AP/Lv`) และหน้าต่างทอยลูกเต๋า 1d20 พร้อมหลายแนวทาง (สู้/คิด/หนี) คำนวณ `%` โอกาสสำเร็จจาก Stat และอุปกรณ์สวมใส่

## การรันในเครื่อง (Local Development)
```bash
npm install
npm run dev
```

## การ Build และ Deploy (Vercel / GitHub)
1. Push โค้ดขึ้น GitHub
2. นำโปรเจกต์เข้า **Vercel** (`npm run build`, Output: `dist`)
3. ไฟล์ `vercel.json` และ `api/wikia-img.js` จะจัดการ Proxy รูปภาพจาก SAO Fandom Wiki ให้อัตโนมัติ
4. ผู้เล่นแต่ละคนสามารถใส่ Gemini API Key ของตนเองในหน้า **Settings** หรือเล่นผ่าน **Demo Mode** ได้ทันที (ข้อมูลเก็บใน `localStorage` ของเบราว์เซอร์ผู้เล่น)
