# ⛩️ HƯỚNG DẪN SỬ DỤNG - NIHONGO AI ASSISTANT

Chào mừng bạn đến với **NihonGo AI** - Trợ lý thông minh hỗ trợ học tiếng Nhật theo giáo trình Minna no Nihongo kết hợp ghi chú và tương tác AI!

---

## 🚀 1. Cấu hình Gemini API Key ban đầu (Chỉ cần làm 1 lần)
1. Nhấp vào biểu tượng **⚙️ Cài đặt** ở góc trên bên phải.
2. Dán mã **Gemini API Key** của bạn (lấy miễn phí tại [Google AI Studio](https://aistudio.google.com/)).
3. Nhấp nút **🔄 Tải tất cả Model** -> Hệ thống sẽ tải danh sách 5 model khả dụng:
   - ⭐ **Gemini 3.5 Flash Lite** *(Khuyên dùng, tốc độ cao, 500 requests/ngày)*
   - **Gemini 3.1 Flash Lite** *(500 requests/ngày)*
   - **Gemini 3.5 Flash** *(20 requests/ngày)*
   - **Gemini 3.6 Flash** *(20 requests/ngày)*
   - **Gemini 3.7 Flash** *(20 requests/ngày)*
4. Nhấp **Lưu cấu hình**. Khi đèn báo hiển thị `● Gemini AI: Đã kết nối` màu xanh là bạn đã sẵn sàng!

---

## 📝 2. Tạo & Quản lý bài học
1. Nhấp nút **➕ Tạo bài học mới** trên thanh công cụ.
2. Chọn bài học theo giáo trình Minna no Nihongo (Bài 1 đến Bài 50) hoặc chọn *✏️ Tự đặt tên bài học tùy ý*.
3. Soạn thảo ghi chú với giao diện Markdown trực quan, chia đề mục rõ ràng, thêm thẻ Tag và chọn trạng thái **Đang học** hoặc **Hoàn thành**.
4. Dữ liệu ghi chú được tự động lưu cục bộ an toàn trên trình duyệt của bạn.

---

## 🤖 3. Học cùng Sensei AI
- **Gợi ý lệnh nhanh (Quick Prompts):** Bấm vào các chip gợi ý bên dưới khung chat để yêu cầu AI nhanh:
  - 📖 *Tổng hợp từ vựng, ngữ pháp bài đang mở* (trích xuất 10 - 15 từ vựng trọng tâm phân loại Danh từ, Động từ, Tính từ kèm Hán Việt và nghĩa).
  - 🎯 *Tạo 5 câu trắc nghiệm & điền từ*.
  - 🔍 *Giải thích chi tiết cấu trúc ngữ pháp khó*.
- **Xuất dữ liệu một chạm:**
  - **📋 Sao chép Notion:** Copy nội dung dạng Markdown chuẩn đẹp để dán ngay vào Notion.
  - **📥 Lưu vào bài học:** Tạo nhanh một bài học ghi chú riêng mới độc lập từ kết quả AI hoặc lưu nối tiếp vào bài học sẵn có.

---

## 💡 4. Các tiện ích nâng cao
- ↔️ **Kéo co giãn khung Chat:** Rê chuột vào thanh phân cách giữa 2 cột để kéo to/nhỏ khung chat theo ý thích. Nhấp đúp chuột vào thanh phân cách để khôi phục độ rộng mặc định (460px).
- 📲 **Cài đặt thành Ứng dụng (PWA):** Bấm nút **"📲 Tải App"** trên thanh công cụ để cài đặt NihonGo AI về máy tính hoặc điện thoại dùng như phần mềm độc lập.
- 🔄 **Làm mới trang (F5):** Bấm nút icon xoay tròn `🔄` trên thanh công cụ để tải lại ứng dụng nhanh chóng.
- 🌙 **Chế độ Sáng / Tối:** Bấm biểu tượng 🌙/☀️ để bảo vệ mắt khi học ban đêm.

---

## ☁️ 5. Đăng nhập Google & Lưu trữ Đám mây Firebase
- **Đăng nhập Google 1 chạm:** Bấm nút **"Đăng nhập Google"** trên thanh tiêu đề để đăng nhập tài khoản Google của bạn.
- **Lưu trữ & Đồng bộ tự động:**
  - Mọi bài học ghi chú, thay đổi nội dung và lịch sử Chat AI sẽ tự động lưu và đồng bộ lên **Firebase Firestore** theo tài khoản của bạn.
  - Khi đăng nhập trên thiết bị khác (điện thoại, máy tính khác), toàn bộ bài học sẽ tự động được tải về đầy đủ.
- **Menu Quản lý Tài khoản:**
  - Nhấp vào **Avatar Google** trên thanh công cụ để xem email, trạng thái đồng bộ, nút **"🔄 Đồng bộ ngay"** và **"🚪 Đăng xuất"**.
- **Tùy chỉnh Firebase Project:**
  - Mở **⚙️ Cài đặt** -> chọn tab **🔥 Firebase Cloud Sync** để dán cấu hình Firebase Project của riêng bạn hoặc xem hướng dẫn tạo Firebase miễn phí.

