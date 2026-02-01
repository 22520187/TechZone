# TechZone

Hệ thống thương mại điện tử bán thiết bị công nghệ với React + .NET Core.

## Yêu cầu hệ thống

- **Node.js** 16+ và npm
- **.NET SDK** 8.0
- **SQL Server** (hoặc sử dụng connection string có sẵn)

## Cài đặt

### 1. Backend (.NET)

```bash
cd TechZone.Server
dotnet restore
dotnet build
```

### 2. Frontend (React)

```bash
cd techzone.client
npm install
```

## Chạy dự án

### Chạy Backend

```bash
cd TechZone.Server
dotnet run
```

API chạy tại: `https://localhost:5288`

### Chạy Frontend

```bash
cd techzone.client
npm run dev
```

Frontend chạy tại: `http://localhost:3000`

## Tính năng chính

-  Quản lý sản phẩm, đơn hàng, giỏ hàng
-  Xác thực người dùng (JWT)
-  Thanh toán VNPay
-  Chatbot AI (Gemini/OpenAI)
-  Quản lý bảo hành
-  Dashboard quản trị

## Công nghệ

**Backend:** .NET 8, Entity Framework Core, SQL Server, JWT, AutoMapper

**Frontend:** React 19, Redux Toolkit, Vite, TailwindCSS, Ant Design

## License

MIT

