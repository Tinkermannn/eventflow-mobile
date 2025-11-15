# Dokumentasi Backend EventFlow (Final)

## 1. Ringkasan
EventFlow adalah backend event management yang scalable, modular, dan type-safe, mendukung fitur real-time, geofencing, pelaporan, notifikasi, dan voting. Dibangun dengan Node.js, Express, TypeScript, Prisma ORM, dan Socket.io, serta menerapkan linting dan kualitas kode yang ketat.

## 2. Arsitektur, Stack & Struktur Folder

### Stack
- **Node.js**: Runtime untuk logika backend
- **Express**: Framework REST API
- **TypeScript**: Type safety dan maintainability
- **Prisma ORM**: Akses database PostgreSQL
- **Socket.io**: Komunikasi real-time
- **Cloudinary**: Upload avatar/gambar
- **Prettier & ESLint**: Format dan linting kode

### Struktur Folder & Penjelasan

```
c:/Users/dapah/Documents/WEB/be-ef/
├── package.json                # Dependensi & script project
├── README.md                   # Ringkasan & instruksi project
├── tsconfig.json               # Konfigurasi TypeScript
├── .env                        # Variabel lingkungan (DB, JWT, Cloudinary, dll)
├── .gitignore                  # Aturan git ignore
├── docs/
│   ├── api-contract.md         # Kontrak API, daftar endpoint, payload
│   └── BACKEND_FINAL_DOCUMENTATION.md # Dokumentasi backend final
├── prisma/
│   ├── schema.prisma           # Skema database (model, relasi)
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20251110093256_init/
│           └── migration.sql
├── src/
│   ├── index.ts                # Entry point utama (Express app/server)
│   ├── config/
│   │   ├── env.ts              # Loader variabel lingkungan
|   |   ├── swagger.ts          # Setup Swagger/OpenAPI dokumentasi
│   │   └── prisma.ts           # Instance Prisma client
│   ├── controllers/
│   │   ├── authController.ts   # Endpoint autentikasi (register, login, Google)
│   │   ├── userController.ts   # Profil user, update, hapus
│   │   ├── eventController.ts  # CRUD event, join, detail
│   │   ├── reportController.ts # Endpoint laporan/insiden/media
│   │   ├── notificationController.ts # Endpoint notifikasi
│   │   ├── userNotificationController.ts # Logika notifikasi user
│   │   ├── deviceController.ts # Endpoint manajemen device
│   │   ├── locationController.ts # Endpoint lokasi/geofencing
│   │   ├── virtualAreaController.ts # Endpoint area virtual (polygon)
│   │   ├── googleAuthController.ts # Logika OAuth Google (Future Development)
│   │   └── ...                   # Controller fitur lain
│
│ 
│   ├── middleware/
│   │   └── requireRole.ts        # Middleware akses berbasis role
│   ├── repositories/
│   │   ├── userRepository.ts     # Query user: cari, buat, update, hapus user
│   │   ├── eventRepository.ts    # Query event: cari, list, buat, update, hapus event
│   │   ├── reportRepository.ts   # Query laporan: cari, list, buat, update, hapus laporan
│   │   ├── notificationRepository.ts # Query notifikasi: cari, list, buat, update, hapus notifikasi
│   │   ├── participantLocationRepository.ts # Query lokasi peserta: cari, list, upsert lokasi
│   │   ├── userNotificationRepository.ts # Query notifikasi user: hitung unread, cari, list, buat, update, hapus
│   │   ├── deviceRepository.ts   # Query device: cari device user, buat, update, hapus device
│   │   ├── eventParticipantRepository.ts # Query peserta event: cari, list, buat, update, hapus peserta
│   │   ├── virtualAreaRepository.ts # Query area virtual: cari, list, buat, update, hapus area
│   │   ├── pollRepository.ts         # Query polling/voting: submit vote, ambil opsi & hasil, hapus vote
│   │   ├── chatRepository.ts         # Query chat: buat, ambil, update, hapus pesan chat (termasuk soft delete)
│   ├── routes/
│   │   ├── authRoutes.ts             # Route autentikasi
│   │   ├── chatRoutes.ts             # Route chat grup event
│   │   ├── deviceRoutes.ts           # Route device user
│   │   ├── eventRoutes.ts            # Route event (CRUD, join, detail)
│   │   ├── locationRoutes.ts         # Route lokasi peserta event
│   │   ├── notificationRoutes.ts     # Route notifikasi event/user
│   │   ├── pollRoutes.ts             # Route polling/voting event
│   │   ├── reportRoutes.ts           # Route laporan event
│   │   ├── userNotificationRoutes.ts # Route notifikasi user
│   │   ├── userRoutes.ts             # Route user (profil, update, hapus)
│   │   ├── virtualAreaRoutes.ts      # Route area virtual/geofencing
│   ├── utils/
│   │   ├── baseResponse.ts       # Format response standar
│   │   ├── errorResponse.ts      # Format response error
│   │   ├── jwt.ts                # Helper JWT sign/verify
│   │   ├── cloudinary.ts         # Helper upload Cloudinary
│   │   ├── geo.ts                # Logika geofencing/polygon
│   │   ├── socket.ts             # Emit event Socket.io
│   │   ├── requireAuth.ts        # Middleware autentikasi
│   │   └── locationSocket.ts     # Helper socket lokasi
│   └── types/
│       ├── baseResponse.ts           # Tipe response API standar
│       ├── chat.ts                   # Tipe pesan chat
│       ├── device.ts                 # Tipe model device
│       ├── event.ts                  # Tipe model event
│       ├── eventParticipant.ts       # Tipe peserta event
│       ├── jwtPayload.ts             # Tipe payload JWT
│       ├── notification.ts           # Tipe/interface notifikasi
│       ├── participantLocation.ts    # Tipe lokasi peserta
│       ├── poll.ts                   # Tipe polling/voting
│       ├── report.ts                 # Tipe/interface laporan
│       ├── socket.ts                 # Tipe event socket
│       ├── user.ts                   # Tipe/interface user
│       ├── virtualArea.ts            # Tipe area virtual
```

### Penjelasan
- **package.json**: Dependensi & script project
- **README.md**: Ringkasan & instruksi project
- **tsconfig.json**: Konfigurasi TypeScript
- **.env**: Variabel lingkungan (DB, JWT, Cloudinary, dll)
- **.gitignore**: Aturan git ignore
- **docs/**: Kontrak API & dokumentasi backend
- **prisma/**: Skema database & riwayat migrasi
- **src/index.ts**: Entry point utama, inisialisasi Express app/server
- **src/swagger.ts**: Setup Swagger/OpenAPI untuk auto-dokumentasi API
- **src/config/**: Loader environment & Prisma client
- **src/controllers/**: Logika bisnis tiap endpoint, validasi input, format response
- **src/repositories/**: Query Prisma ORM, return tipe strict, tanpa `any`
- **src/routes/**: Definisi route, mapping HTTP ke controller
- **src/middleware/**: Kontrol akses, autentikasi, role
- **src/utils/**: Helper JWT, socket, geo, error, Cloudinary, dll
- **src/types/**: Interface TypeScript untuk semua model, payload, event socket

## 3. Fitur Utama
- **Autentikasi**: JWT, Google OAuth
- **Manajemen User**: Profil, update, upload avatar
- **Manajemen Event**: CRUD, join via kode, geolokasi
- **Pelaporan**: Laporan insiden/media per event
- **Broadcast & Notifikasi**: Notifikasi real-time & persist
- **Geofencing**: Area virtual (polygon) per event
- **Voting/Polling**: Hasil polling real-time
- **Socket.io Events**: Update real-time lokasi, kehadiran, voting, chat, broadcast

## 4. Daftar Endpoint API
Lihat `docs/api-contract.md` untuk daftar endpoint lengkap, payload request/response, dan contoh data.

## 5. Autentikasi & Otorisasi
- **JWT**: Semua endpoint proteksi butuh token Bearer di header `Authorization`.
- **Akses Role**: Endpoint tertentu butuh role `admin` atau `panitia` (lihat middleware route).
- **Google OAuth**: Didukung via endpoint `/auth/google` (Fitur Google OAuth (googleAuthController) saat ini *belum bisa digunakan*, masih tahap pengembangan dan hanya tersedia di localhost agar implementasi lebih simpel. Endpoint Google OAuth akan diaktifkan setelah proses pengembangan selesai).
- **Soft Delete**: Pesan chat mendukung soft delete.

## 6. Test Case Detail (Per Endpoint)

### Auth (`authRoutes.ts`)
- **POST /auth/register**
  - Berhasil: Registrasi user baru dengan data valid
  - Gagal: Data kurang (nama/email/password/phoneNumber)
  - Gagal: Email sudah terdaftar
  - Berhasil: Mendapatkan JWT token
- **POST /auth/login**
  - Berhasil: Login dengan kredensial valid
  - Gagal: Data kurang
  - Gagal: Kredensial salah
  - Berhasil: Mendapatkan JWT token
- **PATCH /auth/update**
  - Berhasil: Update data user (nama, no hp, avatar, password)
  - Gagal: Token tidak valid/kadaluarsa
  - Gagal: Data kurang
- **DELETE /auth/delete**
  - Berhasil: Hapus user dengan token valid
  - Gagal: Token tidak valid/kadaluarsa

### User (`userRoutes.ts`)
- **GET /users/me**
  - Berhasil: Mendapatkan profil user saat ini
  - Gagal: Token tidak valid/kadaluarsa
- **PATCH /users/me**
  - Berhasil: Update profil (nama, no hp, avatar file)
  - Gagal: Token tidak valid
  - Gagal: File avatar tidak valid
- **DELETE /users/me**
  - Berhasil: Hapus user dengan token valid
  - Gagal: Token tidak valid

### Event (`eventRoutes.ts`)
- **POST /events**
  - Berhasil: Buat event baru (hanya organizer)
  - Gagal: Data kurang
  - Gagal: Tidak punya akses/role salah
- **GET /events/{id}**
  - Berhasil: Ambil detail event
  - Gagal: Event tidak ditemukan
- **GET /events?status=ONGOING|UPCOMING|COMPLETED**
  - Berhasil: List event sesuai status
- **PATCH /events/{id}**
  - Berhasil: Update event (hanya organizer)
  - Gagal: Tidak punya akses/role salah
- **DELETE /events/{id}**
  - Berhasil: Hapus event (hanya organizer)
  - Gagal: Tidak punya akses/role salah
- **POST /events/{id}/join**
  - Berhasil: Join event dengan kode valid
  - Gagal: Kode salah/unauthorized

### Report (`reportRoutes.ts`)
- **POST /{id}/reports**
  - Berhasil: Buat laporan dengan data & media valid
  - Gagal: Data kurang
  - Gagal: Token tidak valid
- **GET /{id}/reports**
  - Berhasil: Ambil semua laporan event
- **PATCH /reports/{reportId}**
  - Berhasil: Update status laporan
  - Gagal: Data kurang/token tidak valid
- **DELETE /reports/{reportId}**
  - Berhasil: Hapus laporan
  - Gagal: Token tidak valid

### Device (`deviceRoutes.ts`)
- **POST /devices/register**
  - Berhasil: Register device dengan pushToken valid
  - Gagal: pushToken kurang
  - Gagal: Token tidak valid
- **GET /devices/me**
  - Berhasil: Ambil semua device user
  - Gagal: Token tidak valid
- **DELETE /devices/{deviceId}**
  - Berhasil: Hapus device sesuai id
  - Gagal: Token/deviceId tidak valid

### Chat (`chatRoutes.ts`)
- **POST /events/{eventId}/chat**
  - Berhasil: Kirim pesan grup chat event
  - Gagal: eventId tidak valid/pesan kosong
  - Gagal: Unauthorized
- **GET /events/{eventId}/chat**
  - Berhasil: Ambil semua pesan grup chat event
  - Gagal: eventId tidak valid
- **PATCH /chat/{chatId}**
  - Berhasil: Update pesan chat (hanya owner)
  - Gagal: Forbidden/chatId tidak valid
- **DELETE /chat/{chatId}**
  - Berhasil: Hapus pesan chat (admin/panitia)
  - Gagal: Unauthorized/chatId tidak valid
- **DELETE /chat/{chatId}/me**
  - Berhasil: Soft delete pesan chat untuk diri sendiri
  - Gagal: Unauthorized/chatId tidak valid

### Location (`locationRoutes.ts`)
- **POST /events/{eventId}/location**
  - Berhasil: Update lokasi peserta
  - Gagal: Data tidak valid/unauthorized
- **GET /events/{eventId}/locations**
  - Berhasil: Ambil semua lokasi peserta
- **GET /events/{eventId}/location/me**
  - Berhasil: Ambil lokasi user saat ini
  - Gagal: Unauthorized

### Notification (`notificationRoutes.ts`)
- **POST /broadcast**
  - Berhasil: Broadcast notifikasi (hanya organizer)
  - Gagal: Data kurang/unauthorized/role salah
- **GET /me/notifications**
  - Berhasil: Ambil semua notifikasi user
  - Gagal: Unauthorized
- **PATCH /me/notifications/{id}/read**
  - Berhasil: Tandai notifikasi sebagai sudah dibaca
  - Gagal: Unauthorized

### Poll (`pollRoutes.ts`)
- **POST /events/{eventId}/polls/{pollId}/vote**
  - Berhasil: Submit vote polling event
  - Gagal: pollOptionId kurang/unauthorized
- **GET /polls/{pollId}/results**
  - Berhasil: Ambil hasil polling event
- **POST /events/{eventId}/polls/{pollId}/unvote**
  - Berhasil: Unvote polling event
  - Gagal: pollOptionId kurang/unauthorized

### User Notification (`userNotificationRoutes.ts`)
- **GET /notifications/me**
  - Berhasil: Ambil semua notifikasi user
  - Gagal: Unauthorized
- **POST /notifications/{notificationId}/read**
  - Berhasil: Tandai notifikasi sebagai sudah dibaca
  - Gagal: Unauthorized
- **GET /notifications/me/unread-count**
  - Berhasil: Ambil jumlah notifikasi belum dibaca
  - Gagal: Unauthorized

### Virtual Area (`virtualAreaRoutes.ts`)
- **POST /events/{id}/virtual-areas**
  - Berhasil: Membuat area virtual baru dengan payload valid (name, area, color)
  - Gagal: Data kurang (misal: area kosong, name kosong, color tidak valid)
  - Gagal: Unauthorized (token tidak valid/kadaluarsa)
  - Gagal: User tidak punya akses ke event
  - Berhasil: Mendapatkan response virtualArea baru
- **GET /events/{id}/virtual-areas**
  - Berhasil: Mendapatkan semua area virtual pada event
  - Gagal: Event tidak ditemukan
  - Gagal: Unauthorized
- **PATCH /virtual-areas/{areaId}**
  - Berhasil: Update data area virtual (name, color, area)
  - Gagal: AreaId tidak ditemukan
  - Gagal: Unauthorized
  - Gagal: User tidak punya akses ke event
- **DELETE /virtual-areas/{areaId}**
  - Berhasil: Hapus area virtual event
  - Gagal: AreaId tidak ditemukan
  - Gagal: Unauthorized
  - Gagal: User tidak punya akses ke event

## 6. Fitur Real-Time (Socket.io)

Fitur real-time di EventFlow menggunakan Socket.io untuk komunikasi dua arah antara client dan server. Berikut daftar event socket yang diimplementasikan (lihat `src/utils/socket.ts`):

- **notification**: Broadcast notifikasi ke semua client
- **locationUpdate**: Update lokasi peserta event secara real-time
- **absensiUpdate**: Update status kehadiran/absensi peserta event
- **geofenceEvent**: Deteksi masuk/keluar area virtual (geofencing)
- **eventUpdate**: Perubahan data event (jadwal, detail, dsb)
- **votingUpdate**: Update hasil voting/polling event
- **chatMessage**: Pesan chat grup event
- **liveReport**: Laporan kejadian/media secara live ke admin/panitia
- **eventBroadcast**: Broadcast info/pengumuman ke semua client event

### Alur Real-Time
1. Client terhubung ke server melalui `/socket.io`.
2. Saat terjadi aksi (chat, update lokasi, voting, laporan, broadcast, dsb), backend memanggil fungsi emit di `socket.ts` untuk mengirim event ke client terkait.
3. Client menerima event socket dan langsung update UI tanpa perlu refresh.
4. Semua event di atas dapat didokumentasikan di Swagger dan diakses oleh client yang terhubung.

Dengan arsitektur ini, semua perubahan penting di event (chat, lokasi, absensi, polling, notifikasi, laporan, broadcast) langsung diterima user secara instan.

## 8. Cara Kerja Program (Flow)

1. **Client** mengirim request ke endpoint API (misal: login, join event, kirim chat, update lokasi).
2. **Express** menerima request, routing ke controller sesuai endpoint.
3. **Controller** memvalidasi input, cek autentikasi/role, lalu panggil repository untuk query database.
4. **Repository** menjalankan query Prisma, return data dengan tipe strict.
5. **Controller** format response (sukses/error) dan kirim ke client.
6. Jika ada event real-time (chat, lokasi, notifikasi, polling), **Socket.io** emit event ke client terkait.
7. **Client** menerima response HTTP dan/atau event socket secara real-time.
8. Semua error diformat konsisten via `baseResponse` dan `errorResponse`.

## 9. Dokumentasi Swagger
### Setup Swagger
- Semua endpoint diberi anotasi JSDoc untuk auto-dokumentasi Swagger.
- Swagger-jsdoc scan semua file route & controller untuk dokumentasi endpoint.
- Swagger UI tersedia di `/api-docs` (lihat setup Express app).
- Untuk melihat & test endpoint, jalankan server lalu buka `http://localhost:4000/api-docs` di browser.
- Konfigurasi Swagger ada di `src/config/swagger.ts` dan bisa diubah (title, version, server, file).

## 10. Catatan Akhir
- Semua kode lint-clean & type-safe
- Modular, mudah dikembangkan, scalable untuk fitur baru
- Lihat `api-contract.md` untuk kontrak & contoh payload
- Lihat test case di atas untuk validasi endpoint

## 11. Test Case Swagger (Payload Request & Response)

### Auth
- **POST /auth/register**
  - Request:
    ```json
    {
      "name": "Budi",
      "email": "budi@email.com",
      "password": "rahasia",
      "phoneNumber": "08123456789"
    }
    ```
  - Response:
    ```json
    {
      "user": { "id": "...", "name": "Budi", ... },
      "token": "jwt-token"
    }
    ```
- **POST /auth/login**
  - Request:
    ```json
    {
      "email": "budi@email.com",
      "password": "rahasia"
    }
    ```
  - Response:
    ```json
    {
      "user": { "id": "...", "name": "Budi", ... },
      "token": "jwt-token"
    }
    ```
- **PATCH /auth/update**
  - Request:
    ```json
    {
      "name": "Budi Baru",
      "phoneNumber": "08123456780",
      "avatarUrl": "https://cloudinary.com/avatar.jpg"
    }
    ```
  - Response:
    ```json
    {
      "user": { "id": "...", "name": "Budi Baru", ... }
    }
    ```
- **DELETE /auth/delete**
  - Response:
    ```json
    { "success": true }
    ```

### User
- **GET /users/me**
  - Response:
    ```json
    { "user": { "id": "...", "name": "Budi", ... } }
    ```
- **PATCH /users/me**
  - Request:
    ```json
    {
      "name": "Budi Update",
      "phoneNumber": "08123456781"
    }
    ```
  - Response:
    ```json
    { "user": { "id": "...", "name": "Budi Update", ... } }
    ```
- **DELETE /users/me**
  - Response:
    ```json
    { "success": true }
    ```

### Event
- **POST /events**
  - Request (hanya bisa oleh user dengan role ORGANIZER):
    ```json
    {
      "name": "Mabim",
      "startTime": "2025-11-20T08:00:00Z",
      "endTime": "2025-11-20T17:00:00Z",
      "locationName": "Aula",
      "latitude": -6.2,
      "longitude": 106.8,
      "joinCode": "ABC123"
    }
    ```
    *Catatan: Field description opsional, field lain wajib. Pastikan JWT token dan role ORGANIZER.*
  - Response sukses:
    ```json
    { "event": { "id": "...", "name": "Mabim", ... } }
    ```
  - Response gagal (bukan organizer):
    ```json
    { "error": "Unauthorized" }
    ```
  - Response gagal (data kurang):
    ```json
    { "error": "Data tidak lengkap" }
    ```
- **GET /events/{id}**
  - Response:
    ```json
    { "event": { "id": "...", "name": "Mabim", ... } }
    ```
- **GET /events?status=ONGOING**
  - Response:
    ```json
    [ { "id": "...", "name": "Mabim", ... } ]
    ```
- **PATCH /events/{id}**
  - Request (hanya organizer):
    ```json
    {
      "name": "Mabim Update",
      "description": "Update Deskripsi"
    }
    ```
  - Response sukses:
    ```json
    { "event": { "id": "...", "name": "Mabim Update", ... } }
    ```
  - Response gagal (bukan organizer):
    ```json
    { "error": "Unauthorized" }
    ```
- **DELETE /events/{id}**
  - Response sukses:
    ```json
    { "success": true }
    ```
  - Response gagal (bukan organizer):
    ```json
    { "error": "Unauthorized" }
    ```
- **POST /events/{id}/join**
  - Request:
    ```json
    { "joinCode": "ABC123" }
    ```
  - Response sukses:
    ```json
    { "event": { "id": "...", "name": "Mabim", ... }, "participant": { "id": "...", ... } }
    ```
  - Response gagal (kode salah):
    ```json
    { "error": "Kode event salah" }
    ```

### Report
- **POST /{id}/reports**
  - Request:
    ```json
    {
      "category": "SECURITY",
      "description": "Ada masalah keamanan",
      "latitude": -6.2,
      "longitude": 106.8
    }
    ```
  - Response:
    ```json
    { "report": { "id": "...", "category": "SECURITY", ... } }
    ```
- **GET /{id}/reports**
  - Response:
    ```json
    [ { "id": "...", "category": "SECURITY", ... } ]
    ```
- **PATCH /reports/{reportId}**
  - Request:
    ```json
    { "status": "RESOLVED" }
    ```
  - Response:
    ```json
    { "report": { "id": "...", "status": "RESOLVED", ... } }
    ```
- **DELETE /reports/{reportId}**
  - Response:
    ```json
    { "success": true }
    ```

### Broadcast & Notification
- **POST /broadcast**
  - Request:
    ```json
    {
      "eventId": "cmhuc1krd000025rijhhcwxoy",
      "category": "SECURITY",
      "message": "Harap tenang, petugas menuju lokasi.",
      "title": "Peringatan",
      "type": "INFO"
    }
    ```
  - Response:
    ```json
    { "notification": { "id": "...", "message": "Harap tenang...", ... } }
    ```
- **GET /me/notifications**
  - Response:
    ```json
    [ { "id": "...", "message": "Harap tenang...", ... } ]
    ```
- **PATCH /me/notifications/{id}/read**
  - Response:
    ```json
    { "notification": { "id": "...", "read": true, ... } }
    ```

### Geofencing (VirtualArea)
- **POST /events/{id}/virtual-areas**
  - Request:
    ```json
    {
      "name": "Area Aula",
      "area": [ [106.8, -6.2], [106.81, -6.21], [106.82, -6.22] ],
      "color": "#FF0000"
    }
    ```
  - Response:
    ```json
    { "virtualArea": { "id": "...", "name": "Area Aula", ... } }
    ```
- **GET /events/{id}/virtual-areas**
  - Response:
    ```json
    [ { "id": "...", "name": "Area Aula", ... } ]
    ```
- **PATCH /virtual-areas/{areaId}**
  - Request:
    ```json
    { "name": "Area Baru", "color": "#00FF00" }
    ```
  - Response:
    ```json
    { "virtualArea": { "id": "...", "name": "Area Baru", ... } }
    ```
- **DELETE /virtual-areas/{areaId}**
  - Response:
    ```json
    { "success": true }
    ```

### Poll
- **POST /events/{eventId}/polls/{pollId}/vote**
  - Request:
    ```json
    { "pollOptionId": "option1" }
    ```
  - Response:
    ```json
    { "poll": { "id": "...", "optionId": "option1", ... } }
    ```
- **GET /polls/{pollId}/results**
  - Response:
    ```json
    [ { "optionId": "option1", "count": 10 }, { "optionId": "option2", "count": 5 } ]
    ```
- **POST /events/{eventId}/polls/{pollId}/unvote**
  - Request:
    ```json
    { "pollOptionId": "option1" }
    ```
  - Response:
    ```json
    { "poll": { "id": "...", "optionId": null, ... } }
    ```

### Device
- **POST /devices/register**
  - Request:
    ```json
    { "pushToken": "expo-token" }
    ```
  - Response:
    ```json
    { "device": { "id": "...", "pushToken": "expo-token", ... } }
    ```
- **GET /devices/me**
  - Response:
    ```json
    [ { "id": "...", "pushToken": "expo-token", ... } ]
    ```
- **DELETE /devices/{deviceId}**
  - Response:
    ```json
    { "success": true }
    ```

### Location
- **POST /events/{eventId}/location**
  - Request:
    ```json
    { "latitude": -6.2, "longitude": 106.8 }
    ```
  - Response:
    ```json
    { "location": { "id": "...", "latitude": -6.2, "longitude": 106.8, ... } }
    ```
- **GET /events/{eventId}/locations**
  - Response:
    ```json
    [ { "id": "...", "latitude": -6.2, "longitude": 106.8, ... } ]
    ```
- **GET /events/{eventId}/location/me**
  - Response:
    ```json
    { "location": { "id": "...", "latitude": -6.2, "longitude": 106.8, ... } }
    ```

### User Notification
- **GET /notifications/me**
  - Response:
    ```json
    [ { "id": "...", "message": "Harap tenang...", ... } ]
    ```
- **POST /notifications/{notificationId}/read**
  - Response:
    ```json
    { "notification": { "id": "...", "read": true, ... } }
    ```
- **GET /notifications/me/unread-count**
  - Response:
    ```json
    { "count": 2 }
    ```

---
Setiap payload di atas bisa langsung dicoba di Swagger UI untuk uji endpoint satu per satu.
