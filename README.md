# Hotel Management System

## Công nghệ

* **Backend:** Java 21, Spring Boot 3.4, Maven
* **Frontend:** React, Vite
* **Database:** PostgreSQL 16
* **Cache:** Redis
* **Migration:** Flyway
* **Authentication:** JWT
* **API Testing:** Postman, Playwright
* **Container:** Docker Compose

## Cấu trúc thư mục

```text
Hotel_Management_SE113/
├── backend/
│   ├── .env.example        # mẫu biến môi trường
│   ├── .env                # cấu hình thật của bạn (tự tạo từ .env.example)
│   └── hotel/              # mã nguồn Spring Boot, docker-compose.yaml, mvnw
├── frontend/               # React + Vite
└── e2e-tests/              # Playwright
```

## Yêu cầu cài đặt

* JDK 21
* Node.js và npm
* Docker Desktop (đang chạy)

## 1. Clone project

```bash
git clone https://github.com/thaikhiem1/Hotel_Management_SE113.git
cd Hotel_Management_SE113
```

## 2. Cấu hình biến môi trường

Backend và Docker Compose cùng đọc tệp `backend/.env`. Docker Compose yêu cầu tệp này phải tồn tại (thiếu thì `docker compose up` báo lỗi), nên tạo trước từ mẫu:

**Windows (PowerShell):**

```powershell
Copy-Item backend/.env.example backend/.env
```

**Git Bash / Linux / macOS:**

```bash
cp backend/.env.example backend/.env
```

Giá trị trong `.env.example` đã chạy được ngay cho môi trường phát triển. Chỉ cần sửa khi cần đổi cổng hoặc thông tin kết nối.

| Biến | Mặc định | Ý nghĩa |
| ---- | -------- | ------- |
| `APP_Name` | `QLKS` | Tên ứng dụng |
| `SERVER_PORT` | `8080` | Cổng Backend |
| `POSTGRES_HOST_PORT` | `5434` | Cổng PostgreSQL trên máy |
| `DB_URL` | `jdbc:postgresql://localhost:5434/QLKS_database` | Địa chỉ cơ sở dữ liệu (đổi cổng cho khớp `POSTGRES_HOST_PORT`) |
| `DB_USERNAME` / `DB_PASSWORD` | `QLKS_user` / `QLKS_password` | Tài khoản cơ sở dữ liệu |
| `DB_DRIVER` | `org.postgresql.Driver` | Driver JDBC |
| `REDIS_HOST` / `REDIS_HOST_PORT` | `localhost` / `6379` | Redis |
| `FLYWAY_ENABLED` | `true` | Bật/tắt migration tự động |
| `FLYWAY_BASELINE_ON_MIGRATE` | `false` | Flyway baseline khi cơ sở dữ liệu đã có dữ liệu |
| `FLYWAY_LOCATIONS` | `classpath:db/migration` | Thư mục chứa các tệp migration |
| `FLYWAY_VALIDATE_ON_MIGRATE` | `true` | Kiểm tra checksum migration |
| `JPA_DDL_AUTO` | `none` | Hibernate không tự sửa bảng (cấu trúc do Flyway quản lý) |
| `JPA_DEFER_DATASOURCE_INITIALIZATION` | `false` | Cấu hình JPA |
| `JPA_OPEN_IN_VIEW` | `false` | Cấu hình JPA |
| `JWT_SECRET` | giá trị phát triển có sẵn | Khóa ký JWT, tối thiểu 32 ký tự, **phải đổi khi triển khai thật** |
| `JWT_EXPIRATION_MS` | `28800000` | Thời gian sống của token (8 giờ) |
| `BOOTSTRAP_ADMIN_USERNAME` / `BOOTSTRAP_ADMIN_PASSWORD` | `admin` / `Admin@123` | Tài khoản ADMIN khởi tạo, chỉ tạo khi hệ thống chưa có ADMIN nào |
| `AVATAR_UPLOAD_DIR` | `uploads/avatars` | Thư mục lưu ảnh đại diện tải lên |

> `backend/.env` chứa cấu hình riêng của máy bạn, không đưa mật khẩu và `JWT_SECRET` thật lên Git.

## 3. Chạy Database

Docker Compose nằm trong `backend/hotel`. Đảm bảo Docker Desktop đang chạy:

```bash
cd backend/hotel
docker compose up -d
```

Kiểm tra:

```bash
docker compose ps
```

PostgreSQL (mặc định):

```text
localhost:5434
```

Redis (mặc định):

```text
localhost:6379
```

> Docker Compose chỉ lấy giá trị cổng (`POSTGRES_HOST_PORT`, `REDIS_HOST_PORT`) từ `backend/.env` khi chạy với tùy chọn
> `docker compose --env-file ../.env up -d`. Nếu không dùng tùy chọn này, cổng mặc định là 5434 và 6379.

Flyway sẽ tự động chạy migration khi Backend khởi động.

## 4. Chạy Backend

Mở terminal mới:

```bash
cd backend/hotel
./mvnw spring-boot:run
```

Trên Windows PowerShell dùng `.\mvnw.cmd spring-boot:run`. Nếu đã cài Maven thì có thể dùng `mvn spring-boot:run`.

Backend:

```text
http://localhost:8080
```

Backend đọc cấu hình từ `backend/.env`. Nếu không có tệp này, Backend dùng các giá trị mặc định trong `application.properties` (khớp với cấu hình Docker Compose mặc định).

## 5. Chạy Frontend

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

> Frontend gọi API tại `http://localhost:8080/api`. Nếu đổi `SERVER_PORT`, sửa `BASE_URL` trong `frontend/src/services/api.js`.

## 6. Quick Start

Chạy theo thứ tự:

**Bước 0 – Tạo cấu hình (chỉ lần đầu)**

```bash
cp backend/.env.example backend/.env
```

**Terminal 1 – Database**

```bash
cd backend/hotel
docker compose up -d
```

**Terminal 2 – Backend**

```bash
cd backend/hotel
./mvnw spring-boot:run
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

## 7. Tài khoản test

| Username    | Password | Role     |
| ----------- | -------- | -------- |
| `admin`     | `123456` | ADMIN    |
| `manager`   | `123456` | MANAGER   |
| `receptionist` | `123456` | RECEPTIONIST |

> Các tài khoản này được tạo bằng migration seed. Nếu dùng dữ liệu khác, sử dụng thông tin trong database của project.

## 8. Chạy test

Test backend (cần Docker Desktop và cơ sở dữ liệu đang chạy; nên dùng cơ sở dữ liệu riêng để không ảnh hưởng dữ liệu đang dùng):

```bash
cd backend/hotel
./mvnw test
```

Unit test của các Service (không cần cơ sở dữ liệu):

```bash
./mvnw test -Dtest="AccountServiceTest,EmployeeServiceTest,CustomerServiceTest,RoomTypesServiceTest"
```

Test giao diện và API bằng Playwright xem hướng dẫn trong `e2e-tests/README.md`.

## 9. Reset Database

Nếu cần xóa toàn bộ database và chạy Flyway lại từ đầu:

```bash
cd backend/hotel
docker compose down -v
docker compose up -d
```

Sau đó chạy lại Backend:

```bash
./mvnw spring-boot:run
```
