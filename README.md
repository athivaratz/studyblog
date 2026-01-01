# 📚 studyblog

> ผู้ช่วยจัดการการเรียนสไตล์ Y2K - Academic Organizer for Thai Students

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12.7-FFCA28?style=flat-square&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)

<p align="center">
  <img src="public/icons/icon-192x192.png" alt="studyblog Logo" width="120" />
</p>

## ✨ Features

- 🎨 **Y2K Aesthetic Design** - ดีไซน์สไตล์ย้อนยุค สวยงาม น่ารัก
- 📱 **PWA Support** - ติดตั้งเป็นแอพบนมือถือได้
- 📅 **ปฏิทินการบ้าน** - จัดการกำหนดส่งงานอย่างง่ายดาย
- 📚 **จัดการวิชาเรียน** - เพิ่ม แก้ไข ลบวิชาได้ตามต้องการ
- ✅ **Todo List** - รายการสิ่งที่ต้องทำ
- 🎵 **Music Player** - เพลง Lofi สำหรับอ่านหนังสือ
- ⏰ **นาฬิกา & จับเวลา** - Timer สำหรับเทคนิค Pomodoro
- 🌙 **Dark Mode** - รองรับโหมดมืด
- 🔐 **Google Sign-in** - เข้าสู่ระบบด้วย Google

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ หรือ [Bun](https://bun.sh/) (แนะนำ)
- [Firebase Project](https://console.firebase.google.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/studyblog.git
   cd studyblog
   ```

2. **Install dependencies**
   ```bash
   bun install
   # หรือ
   npm install
   ```

3. **Setup environment variables**
   
   สร้างไฟล์ `.env.local` แล้วเพิ่มค่า Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Deploy Firestore rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Run the development server**
   ```bash
   bun run dev
   # หรือ
   npm run dev
   ```

6. เปิด [http://localhost:3000](http://localhost:3000) บน browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # หน้าหลัก (Dashboard)
│   ├── subjects/          # หน้าจัดการวิชา
│   ├── homework/          # หน้าจัดการการบ้าน
│   ├── calendar/          # หน้าปฏิทิน
│   └── settings/          # หน้าตั้งค่า
├── components/
│   ├── ui/                # UI Components (PaperCard, RetroButton, etc.)
│   ├── layout/            # Layout Components (Navbar, FolderLayout)
│   ├── widgets/           # Widgets (Clock, Timer, Music, Todo)
│   └── auth/              # Authentication Components
├── contexts/              # React Contexts (Auth, Theme, Music)
├── hooks/                 # Custom Hooks (useFirebaseData)
└── lib/                   # Firebase config & services
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React Framework with App Router |
| **React 19** | UI Library |
| **TypeScript** | Type Safety |
| **Tailwind CSS 4** | Styling |
| **Firebase** | Auth & Firestore Database |
| **Framer Motion** | Animations |
| **Lucide React** | Icons |

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |

## 🎨 Design System

### Colors (Y2K Palette)
- **Pastel Yellow**: `#FFF3B0`
- **Pastel Pink**: `#FFD6E0`
- **Pastel Blue**: `#C5E8FF`
- **Pastel Green**: `#D4F5D4`
- **Pastel Purple**: `#E8D5F2`

### Fonts
- **Felipa** - Decorative headings
- **Kanit** - Thai body text

### Components
- `PaperCard` - กล่องสไตล์กระดาษ
- `RetroButton` - ปุ่มสไตล์ Y2K
- `FolderTab` - แท็บสไตล์แฟ้ม
- `StickyNote` - โน้ตกระดาษ

## 📱 PWA Installation

### iOS (Safari)
1. เปิด studyblog บน Safari
2. กดปุ่ม Share
3. เลือก "Add to Home Screen"

### Android (Chrome)
1. เปิด studyblog บน Chrome
2. กดเมนู 3 จุด
3. เลือก "Install app" หรือ "Add to Home screen"

## 🔒 Firebase Security Rules

โปรเจคนี้มี Firestore Security Rules ที่จำกัดการเข้าถึงข้อมูล:
- ผู้ใช้สามารถอ่าน/เขียนได้เฉพาะข้อมูลของตัวเองเท่านั้น
- ดู `firestore.rules` สำหรับรายละเอียด

## 📄 License

MIT License - ใช้งานได้อย่างอิสระ

## 👨‍💻 Author

**Athivarat Rattanalert**

---

<p align="center">
  Made with 💖 for Thai Students
</p>
