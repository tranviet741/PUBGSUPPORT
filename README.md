# PUBG PC Tool — Tính cối & Hầm bí mật

Công cụ web hỗ trợ đo khoảng cách súng cối trên bản đồ PUBG PC và xem vị trí hầm bí mật.

## Cấu trúc thư mục

```
PUBGEXE/
├── index.html          # Trang chính (cần đăng nhập)
├── login.html          # Trang đăng nhập / đăng ký
├── css/
│   ├── main.css        # Giao diện chính + modal
│   └── auth.css        # Giao diện đăng nhập
├── js/
│   ├── config.js       # Dữ liệu map, hầm bí mật
│   ├── auth.js         # Xử lý đăng nhập (localStorage)
│   ├── login.js        # Logic trang login
│   └── app.js          # Logic map, đo cối, modal
├── img/                # Ảnh bản đồ hầm bí mật
│   ├── Erangel.png
│   ├── miramar.png
│   ├── taego.png
│   ├── vikendi.png
│   └── paramo.png
└── README.md
```

## Tính năng

- Đo khoảng cách súng cối trên các map PUBG PC
- Hiển thị vị trí hầm bí mật trên map tương tác
- **Xem bản đồ hầm bí mật** — chọn map, mở modal xem ảnh từ thư mục `img/`
- Đăng nhập / đăng ký tài khoản cơ bản (lưu trên trình duyệt)

## Tài khoản mặc định

| Tên đăng nhập | Mật khẩu |
|---------------|----------|
| `admin`       | `admin123` |

> **Lưu ý:** Đây là xác thực phía client (localStorage), phù hợp demo cá nhân — không dùng cho bảo mật thực tế.

## Chạy thử trên máy

### Cách 1: Mở trực tiếp (nhanh nhất)

Double-click `login.html` hoặc dùng Live Server trong VS Code / Cursor.

### Cách 2: Dùng Python (khuyến nghị)

```bash
cd PUBGEXE
python -m http.server 8080
```

Mở trình duyệt: `http://localhost:8080/login.html`

---

## Hướng dẫn deploy FREE lên web

Dự án này là **static site** (HTML/CSS/JS thuần), deploy miễn phí rất dễ.

### Phương án 1: Netlify (khuyến nghị — dễ nhất)

1. Tạo tài khoản tại [https://netlify.com](https://netlify.com)
2. Kéo thả **toàn bộ thư mục PUBGEXE** vào trang [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. Netlify tự deploy → bạn nhận link dạng `https://tên-ngẫu-nhiên.netlify.app`
4. Vào **Site settings → Domain management** để đổi tên miền miễn phí

**Deploy qua Git (tự động cập nhật):**

```bash
# Trong thư mục PUBGEXE
git init
git add .
git commit -m "Initial deploy"
```

1. Tạo repo trên GitHub (public)
2. Push code lên GitHub
3. Netlify → **Add new site → Import from Git** → chọn repo
4. Build settings: để trống (không cần build command)
5. Publish directory: `/` (root)

### Phương án 2: Vercel

1. Tạo tài khoản tại [https://vercel.com](https://vercel.com)
2. **Add New Project** → import từ GitHub hoặc upload folder
3. Framework Preset: **Other**
4. Deploy → nhận link `https://tên-project.vercel.app`

### Phương án 3: GitHub Pages

1. Push code lên GitHub repo tên `pubg-tool` (ví dụ)
2. Vào repo → **Settings → Pages**
3. Source: **Deploy from branch** → chọn `main` → folder `/ (root)`
4. Link: `https://username.github.io/pubg-tool/login.html`

> Đặt `login.html` làm trang vào vì `index.html` yêu cầu đăng nhập.

### Phương án 4: Cloudflare Pages

1. Tài khoản tại [https://pages.cloudflare.com](https://pages.cloudflare.com)
2. **Create a project** → kết nối GitHub hoặc upload
3. Build command: để trống
4. Output directory: `/`

---

## Lưu ý khi deploy

1. **Ảnh map HD** tải từ PUBG API (cần internet khi dùng)
2. **Ảnh hầm bí mật** trong `img/` phải được upload cùng project
3. Tên file ảnh phân biệt hoa/thường — giữ nguyên như trong thư mục `img/`
4. Nếu link bị 404, kiểm tra đường dẫn tương đối (`css/`, `js/`, `img/`)

## Đổi mật khẩu admin

1. Đăng ký tài khoản mới (tài khoản đầu tiên đăng ký sẽ là admin nếu chưa có user)
2. Hoặc xóa dữ liệu trình duyệt → hệ thống tạo lại admin mặc định
