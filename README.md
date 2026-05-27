# 💰 Expense Tracker — Docker + MongoDB + Node.js

## Cấu trúc project

```
expense-tracker/
├── docker-compose.yml     ← Khởi động toàn bộ hệ thống
├── db/
│   └── seed.js            ← Dữ liệu mẫu MongoDB
├── api/
│   ├── Dockerfile
│   ├── package.json
│   └── index.js           ← Express API
└── frontend/
    └── index.html         ← Giao diện web
```

## Yêu cầu

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã cài và đang chạy

## Chạy project

```bash
# 1. Vào thư mục project
cd expense-tracker

# 2. Khởi động tất cả services
docker compose up -d

# 3. Mở trình duyệt
#    Frontend: http://localhost:8080
#    API:      http://localhost:3000/api/transactions
```

## Dừng project

```bash
docker compose down
```

## Xóa toàn bộ dữ liệu (kể cả database)

```bash
docker compose down -v
```

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/transactions` | Lấy danh sách (filter: type, category, month) |
| POST | `/api/transactions` | Thêm giao dịch mới |
| PUT | `/api/transactions/:id` | Cập nhật giao dịch |
| DELETE | `/api/transactions/:id` | Xóa giao dịch |
| GET | `/api/transactions/summary` | Tổng hợp theo tháng |

## Ví dụ thêm giao dịch qua API

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"description":"Ăn trưa","amount":50000,"category":"Ăn uống","type":"expense","tx_date":"2025-05-11"}'
```

## Kết nối MongoDB trực tiếp (tuỳ chọn)

```bash
docker exec -it expense_mongo mongosh \
  -u admin -p secret123 \
  --authenticationDatabase admin \
  expense_tracker
```
