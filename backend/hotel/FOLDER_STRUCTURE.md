Folder Structure - Hotel management Backend
hotel/ → Root project của hệ thống Hotel Management
│
├── .mvn/ → Cấu hình Maven Wrapper
│ └── wrapper/ → File hỗ trợ Maven Wrapper
│
├── .vscode/ → Cấu hình riêng cho Visual Studio Code
│
└── src/ → Toàn bộ source code của project
│
├── main/ → Source code chính của ứng dụng
│ │
│ ├── java/ → Java source code
│ │ │
│ │ └── com/example/hotel/ → Java package gốc của project
│ │ │
│ │ ├── config/ → Cấu hình Spring Boot, Security, CORS,...
│ │ │
│ │ ├── controllers/ → REST API, nhận HTTP Request
│ │ │
│ │ ├── exception/ → Custom Exception và xử lý lỗi API
│ │ │
│ │ ├── mapper/ → Chuyển đổi Entity ↔ DTO
│ │ │
│ │ ├── model/ → Các model dữ liệu của hệ thống
│ │ │ │
│ │ │ ├── dto/ → Data Transfer Object cho API
│ │ │ │ ├── request/ → DTO nhận dữ liệu từ Client
│ │ │ │ └── response/ → DTO trả dữ liệu về Client
│ │ │ │
│ │ │ └── entities/ → JPA Entity ánh xạ bảng Database
│ │ │
│ │ ├── repository/ → Truy cập Database qua Spring Data JPA
│ │ │
│ │ ├── services/ → Xử lý Business Logic
│ │ │ │
│ │ │ └── impl/ → Implementation của các Service
│ │ │
│ │ └── utils/ → Các hàm tiện ích dùng chung
│ │
│ └── resources/ → Configuration và tài nguyên của ứng dụng
│ │
│ └── db/ → Các tài nguyên liên quan Database
│ │
│ └── migration/ → SQL Migration của Flyway
│
└── test/ → Source code dùng để kiểm thử
│
└── java/ → Java test code
│
└── com/example/hotel/ → Package test tương ứng với source chính
