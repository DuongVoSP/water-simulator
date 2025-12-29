# Hệ thống Quản lý Cấp nước - Truck Planning Simulator

Ứng dụng web mô phỏng hệ thống điều động xe bồn cấp nước tự động.

## Tính năng

- ⚙️ Cấu hình mô phỏng với bước thời gian tùy chỉnh
- 💧 Quản lý nhiều bồn chứa nước với các thông số:
  - Dung tích chứa
  - Lượng nước hiện tại
  - Lượng tiêu thụ mỗi bước thời gian
  - Thời gian di chuyển đến bồn
  - Mức nước duy trì tối thiểu
- 🚛 Quản lý đội xe bồn với dung tích chứa
- 📊 Mô phỏng tự động:
  - Tiêu thụ nước theo từng bước thời gian
  - Tự động phát hiện khi nước xuống dưới mức duy trì
  - Điều động xe bồn đến cấp nước
  - Hiển thị trạng thái real-time

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Build cho production

```bash
npm run build
```

## Cấu trúc dự án

```
water_simulator/
├── src/
│   ├── components/
│   │   ├── InputForm.jsx      # Form nhập liệu
│   │   └── SimulationView.jsx  # Hiển thị kết quả mô phỏng
│   ├── utils/
│   │   └── simulation.js      # Logic mô phỏng
│   ├── App.jsx                # Component chính
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Sử dụng

1. Nhập bước thời gian (giờ) cho mỗi bước tính toán
2. Thêm và cấu hình các bồn chứa nước
3. Thêm và cấu hình các xe bồn
4. Nhấn "Bắt đầu Mô phỏng" để xem kết quả
5. Sử dụng các nút điều khiển để xem mô phỏng theo thời gian

# water-simulator
