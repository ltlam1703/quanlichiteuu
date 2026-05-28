# 💰 Expense Tracker — Full-Stack DevOps Project

**Live URLs:**
- 🌐 Frontend: https://expense-frontend-yj8o.onrender.com
- 🔌 API: https://expense-api-0fuh.onrender.com/health

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET / USER                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
          ┌────────────────▼────────────────┐
          │      Render (Static Site)        │
          │   expense-frontend (Nginx)       │
          │   https://expense-frontend-      │
          │         yj8o.onrender.com        │
          └────────────────┬────────────────┘
                           │ HTTPS REST API calls
          ┌────────────────▼────────────────┐
          │      Render (Web Service)        │
          │    expense-api (Node/Express)    │
          │   https://expense-api-0fuh.      │
          │         onrender.com/api         │
          └────────────────┬────────────────┘
                           │ mongoose / TCP 27017
          ┌────────────────▼────────────────┐
          │         MongoDB Atlas M0         │
          │  cluster0.2b2khqb.mongodb.net    │
          │    DB: expense_tracker           │
          └─────────────────────────────────┘
```

### Thành phần hệ thống

| Layer | Công nghệ | Vai trò |
|-------|-----------|---------|
| Frontend | HTML + Vanilla JS + Nginx | Giao diện người dùng |
| Backend API | Node.js + Express | REST API, business logic |
| Database | MongoDB Atlas M0 | Lưu trữ dữ liệu giao dịch |
| Container | Docker + docker-compose | Local development |
| Deploy | Render.com | Cloud hosting |
| CI/CD | GitHub Actions | Tự động lint, test, build, deploy |

### Cấu trúc thư mục

```
quanlichitieu/
├── .github/
│   └── workflows/
│       └── ci.yml          ← GitHub Actions pipeline
├── api/
│   ├── Dockerfile          ← Container image cho API
│   ├── index.js            ← Express server + routes
│   ├── package.json
│   └── test/
│       └── api.test.js     ← Integration tests
├── db/
│   └── seed.js             ← Dữ liệu mẫu MongoDB
├── frontend/
│   ├── Dockerfile          ← Nginx container
│   └── index.html          ← Single-page app
├── docker-compose.yml      ← Orchestration local
├── nginx.conf              ← Nginx reverse proxy config
├── render.yaml             ← Render Blueprint deploy config
├── .env.example            ← Template biến môi trường
└── README.md
```

---

## 🔄 CI/CD Flow

Pipeline chạy tự động khi push lên nhánh `main` hoặc `dev`:

```
┌──────────────────────────────────────────────────────────┐
│                   GitHub Actions Pipeline                 │
│                                                          │
│  push/PR to main/dev                                     │
│         │                                                │
│         ▼                                                │
│  ┌─────────────┐                                         │
│  │  Job 1: Lint │  npm run lint (ESLint)                 │
│  └──────┬──────┘                                         │
│         │ pass                                           │
│         ▼                                                │
│  ┌─────────────┐                                         │
│  │  Job 2: Test │  Spin up mongo:7 service container     │
│  │              │  npm test (integration tests)          │
│  └──────┬──────┘                                         │
│         │ pass                                           │
│         ▼                                                │
│  ┌──────────────────┐                                    │
│  │ Job 3: Build     │  docker build API image            │
│  │ Docker Image     │  (không push, chỉ verify build OK) │
│  └──────┬───────────┘                                    │
│         │ pass + only main branch                        │
│         ▼                                                │
│  ┌──────────────────┐                                    │
│  │ Job 4: Deploy to │  curl Render Deploy Hook           │
│  │ Render           │  → Trigger redeploy API + Frontend │
│  └──────────────────┘                                    │
└──────────────────────────────────────────────────────────┘
```

### GitHub Secrets cần thiết

| Secret | Mô tả |
|--------|-------|
| `MONGO_TEST_USERNAME` | Username MongoDB cho test |
| `MONGO_TEST_PASSWORD` | Password MongoDB cho test |
| `RENDER_API_KEY` | API key của Render.com |
| `RENDER_API_SERVICE_ID` | Service ID của expense-api |
| `RENDER_FRONTEND_SERVICE_ID` | Service ID của expense-frontend |

---

## 🚀 Hướng dẫn chạy

### Yêu cầu

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã cài và đang chạy
- Git

### Chạy local với Docker

```bash
# 1. Clone repo
git clone <repo-url>
cd quanlichitieu

# 2. Tạo file .env từ template
cp .env.example .env
# Chỉnh sửa .env nếu cần (xem .env.example để biết các biến)

# 3. Khởi động toàn bộ stack
docker compose up -d

# 4. Xem log
docker compose logs -f

# 5. Mở trình duyệt
#    Frontend: http://localhost:8080
#    API:      http://localhost:3000/api/transactions
#    Health:   http://localhost:3000/health
```

### Dừng và dọn dẹp

```bash
# Dừng containers
docker compose down

# Dừng + xóa toàn bộ data (kể cả database)
docker compose down -v
```

### Kiểm tra health

```bash
# API health check
curl http://localhost:3000/health

# Lấy danh sách giao dịch
curl http://localhost:3000/api/transactions
```

---

## 📡 API Endpoints

Base URL (production): `https://expense-api-0fuh.onrender.com`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/health` | Health check |
| GET | `/api/transactions` | Lấy danh sách (filter: `type`, `category`, `month`) |
| POST | `/api/transactions` | Thêm giao dịch mới |
| PUT | `/api/transactions/:id` | Cập nhật giao dịch |
| DELETE | `/api/transactions/:id` | Xóa giao dịch |
| GET | `/api/transactions/summary` | Tổng hợp theo tháng |

### Ví dụ request

```bash
# Thêm chi tiêu
curl -X POST https://expense-api-0fuh.onrender.com/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"description":"Ăn trưa","amount":50000,"category":"Ăn uống","type":"expense","tx_date":"2025-05-11"}'

# Lấy chi tiêu tháng 5
curl "https://expense-api-0fuh.onrender.com/api/transactions?month=2025-05"

# Lấy tổng hợp
curl "https://expense-api-0fuh.onrender.com/api/transactions/summary?month=2025-05"
```

---

## 🔧 Environment Variables

Xem `.env.example` để biết đầy đủ các biến. Không bao giờ commit file `.env` thật lên Git.

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `MONGO_URI` | Connection string MongoDB | `mongodb://user:pass@host/db` |
| `PORT` | Port API server | `3000` |
| `MONGO_INITDB_ROOT_USERNAME` | MongoDB root user (local) | `admin` |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB root password (local) | `secret123` |
| `MONGO_INITDB_DATABASE` | Tên database | `expense_tracker` |
| `MONGO_PORT` | Port MongoDB expose ra host | `27017` |
| `API_PORT` | Port API expose ra host | `3000` |
| `FRONTEND_PORT` | Port frontend expose ra host | `8080` |

---

## 🐛 Debug Incident Log

### Incident: CI/CD pipeline fail — MongoDB port conflict

**Vấn đề:** GitHub Actions test job fail với lỗi connection refused khi kết nối MongoDB.

**Nguyên nhân:** File test cũ hardcode port `27018`, trong khi service container MongoDB trong CI chạy trên port `27017`.

**Cách debug:**
1. Đọc log GitHub Actions → thấy `MongoServerError: connect ECONNREFUSED 127.0.0.1:27018`
2. Kiểm tra `ci.yml` → MongoDB service expose port `27017:27017`
3. Kiểm tra `api.test.js` → phát hiện hardcode `27018`

**Fix:**
```js
// Before (sai)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27018/test';

// After (đúng)
const MONGO_URI = process.env.MONGO_URI; // Luôn dùng env var từ CI
```

**Lesson learned:** Không hardcode port/URL trong test — luôn đọc từ environment variable.

---

### Incident: Docker local — API không kết nối được MongoDB

**Vấn đề:** `docker compose up` chạy OK nhưng API báo `MongoNetworkError`.

**Nguyên nhân:** `MONGO_URI` trong `.env` dùng `localhost:27017` — trong Docker network, containers giao tiếp qua tên service, không phải `localhost`.

**Fix:**
```bash
# Before (sai — localhost chỉ đúng khi chạy trực tiếp trên máy host)
MONGO_URI=mongodb://admin:secret123@localhost:27017/expense_tracker?authSource=admin

# After (đúng — dùng tên service trong docker-compose)
MONGO_URI=mongodb://admin:secret123@mongo:27017/expense_tracker?authSource=admin
```

---

## 👥 Phân công

| Thành viên | Phần trình bày |
|------------|---------------|
| Nguyễn Bá Quân | System demo, API, Frontend |
| Hoàng Minh Hòa | Docker, docker-compose, local setup |
| Trần Văn Long | CI/CD pipeline, GitHub Actions |
| Lương Thanh Lâm | Deploy Render, MongoDB Atlas, Environment |
