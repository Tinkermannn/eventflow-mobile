# eventFlow Backend

Backend untuk aplikasi eventFlow menggunakan Node.js, Express, TypeScript, Prisma, Socket.io, PostgreSQL (Neon), dan JWT.

## Fitur Utama
- Register/login user (participant & organizer)
- Join event dengan kode unik
- Broadcast & notifikasi event
- Laporan (report) dengan kategori
- Profil user & event
- Geofencing & map
- Real-time update peserta/event

## Struktur Folder
- `src/` - kode utama (controllers, models, routes, services, utils)
- `prisma/` - schema & migration
- `.env` - environment variables

## Cara Menjalankan
1. Install dependencies: `npm install`
2. Copy `.env.example` ke `.env` dan isi konfigurasi DB
3. Jalankan migration: `npx prisma migrate dev`
4. Start server: `npm run dev`

## Stack
- Node.js + Express
- TypeScript
- Prisma ORM
- Socket.io
- PostgreSQL (Neon)
- JWT Auth

## Author
- eventFlow Team
