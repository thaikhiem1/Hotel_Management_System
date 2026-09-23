# Hotel Management System

## Công nghệ

* **Backend:** Java, Spring Boot, Maven
* **Frontend:** React, Vite
* **Database:** PostgreSQL
* **Cache:** Redis
* **Migration:** Flyway
* **Authentication:** JWT
* **API Testing:** Postman
* **Container:** Docker Compose

## 1. Clone project

```bash
git clone <https://github.com/thaikhiem1/Hotel_Management_SE113.git>
cd backend
cd hotel
```

## 2. Chạy Database

Đảm bảo Docker Desktop đang chạy.

```bash
docker compose up -d
```

Kiểm tra:

```bash
docker compose ps
```

PostgreSQL:

```text
localhost:5432
```

Redis:

```text
localhost:6379
```

Flyway sẽ tự động chạy migration khi Backend khởi động.

## 3. Chạy Backend

Mở terminal:

```bash
cd backend
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

## 4. Chạy Frontend

Mở terminal mới:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 5. Quick Start

Chạy theo thứ tự:

**Terminal 1 – Database**

```bash
docker compose up -d
```

**Terminal 2 – Backend**

```bash
cd backend
mvn spring-boot:run
```

**Terminal 3 – Frontend**

```bash
cd frontend
npm install
npm run dev
```

Sau đó truy cập:

```text
http://localhost:5173
```

## 6. Tài khoản test

| Username    | Password | Role     |
| ----------- | -------- | -------- |
| `admin`     | `123456` | ADMIN    |
| `manager`   | `123456` | QUANLY   |
| `reception` | `123456` | NHANVIEN |

> Nếu tài khoản test được tạo bằng migration/seed khác, sử dụng thông tin trong database của project.

## 7. Reset Database

Nếu cần xóa toàn bộ database và chạy Flyway lại từ đầu:

```bash
docker compose down -v
docker compose up -d
```

Sau đó chạy lại Backend:

```bash
cd backend
mvn spring-boot:run
```
