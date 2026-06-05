# PUBG PC Tool — Tính cối & Hầm bí mật

Công cụ web hỗ trợ đo khoảng cách súng cối trên bản đồ PUBG PC và xem vị trí hầm bí mật.

## Cấu trúc thư mục

```
PUBGEXE/
├── index.html              # Trang chính (cần đăng nhập)
├── login.html              # Trang đăng nhập
├── admin.html              # Quản lý tài khoản (chỉ admin)
├── supabase-setup.sql      # SQL tạo bảng users trên Supabase
├── css/
├── js/
│   ├── supabase-config.js  # ← ĐIỀN URL + API KEY TẠI ĐÂY
│   ├── auth.js             # Đăng nhập qua Supabase
│   ├── config.js
│   ├── login.js
│   ├── admin.js
│   └── app.js
├── img/
└── README.md
```

## Tính năng

- Đo khoảng cách súng cối trên các map PUBG PC
- **Xem bản đồ hầm bí mật** — chọn map, mở modal xem ảnh
- Admin tạo/xóa tài khoản — **user đăng nhập được từ mọi máy** (qua Supabase)

## Tài khoản admin (hardcode)

| Tên đăng nhập | Mật khẩu |
|---------------|----------|
| `admin` | `pass123qwe!@#` |

Chỉ admin mới vào trang **Quản lý TK** để tạo tài khoản cho user.

---

## Cấu hình Supabase (BẮT BUỘC để user đăng nhập cross-device)

### Bước 1 — Tạo project Supabase (free)

1. Vào [https://supabase.com](https://supabase.com) → đăng ký / đăng nhập
2. **New Project** → đặt tên, chọn region **Singapore** (gần VN nhất)
3. Đợi project khởi tạo (~2 phút)

### Bước 2 — Tạo bảng users

1. Vào **SQL Editor** trong Supabase Dashboard
2. Copy nội dung file `supabase-setup.sql` → **Run**

### Bước 3 — Lấy API Key

1. **Project Settings** (biểu tượng bánh răng) → **API**
2. Copy 2 giá trị:
   - **Project URL** (dạng `https://xxxxx.supabase.co`)
   - **anon public** key

### Bước 4 — Điền vào project

Mở `js/supabase-config.js` và thay:

```javascript
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIs...";
```

### Bước 5 — Push lên GitHub & deploy lại

```powershell
cd "c:\Users\Viet Tran\Desktop\PUBGEXE"
git add .
git commit -m "Add Supabase auth"
git push origin main
```

### Kiểm tra

1. Đăng nhập `admin` / `pass123qwe!@#`
2. Vào **Quản lý TK** → tạo user `testuser` / `123456`
3. Mở site trên **máy khác** (hoặc trình duyệt ẩn danh) → đăng nhập `testuser` → thành công

---

## Chạy thử trên máy

```bash
cd PUBGEXE
python -m http.server 8080
```

Mở: `http://localhost:8080/login.html`

---

## Deploy FREE lên web

### GitHub Pages

1. Push code lên [GitHub repo](https://github.com/tranviet741/PUBGSUPPORT)
2. Repo → **Settings → Pages** → branch `main`, folder `/`
3. Truy cập: `https://tranviet741.github.io/PUBGSUPPORT/login.html`

### Netlify

1. [app.netlify.com](https://app.netlify.com) → Import from Git → chọn repo
2. Build command: để trống · Publish directory: `/`

---

## Push code lên GitHub

```powershell
cd "c:\Users\Viet Tran\Desktop\PUBGEXE"
git add .
git commit -m "Mô tả thay đổi"
git push origin main
```

---

## Lưu ý

- **Admin** luôn đăng nhập được (hardcode trong code), không lưu trên Supabase
- **User** do admin tạo được lưu trên Supabase — mọi máy dùng chung
- Cần internet để đăng nhập user và tải map HD
- `anon key` được thiết kế để dùng public trên frontend — phù hợp static site
