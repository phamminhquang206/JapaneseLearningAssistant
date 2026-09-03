# ⛩️ NIHONGO AI - SPECIFICATIONS & REQUIREMENTS

Tài liệu đặc tả yêu cầu và hiện trạng tính năng của dự án **NihonGo AI (Trợ Lý Học Tiếng Nhật & Ghi Chú Thông Minh)**.

---

## 📌 I. TỔNG QUAN DỰ ÁN (OVERVIEW)

- **Tên ứng dụng:** NihonGo AI - Trợ Lý Học Tiếng Nhật & Ghi Chú Thông Minh.
- **Mục tiêu:** Cung cấp không gian học tiếng Nhật toàn diện theo giáo trình phổ biến (Minna no Nihongo từ Bài 1 đến 50), kết hợp ghi chú Markdown và trợ lý Sensei AI (Google Gemini API) hỗ trợ tổng hợp từ vựng, giải thích ngữ pháp, tạo bài tập trắc nghiệm và đồng bộ ghi chú sang Notion.
- **Kiến trúc công nghệ:**
  - **Front-end:** Pure HTML5, Vanilla CSS3 (Custom Design System, Dark/Light Theme), Vanilla JavaScript (ES6+ Modules).
  - **Xử lý Markdown:** Thư viện cục bộ `marked.min.js` kết hợp bộ tiền xử lý `MarkdownRenderer` khử lỗi format code block thô.
  - **AI Integration:** Google Gemini API (v1beta REST API) kết hợp hệ thống Prompt chuẩn hóa và cơ chế Fallback tự động.
  - **Lưu trữ:** Web Storage API (`localStorage`), đảm bảo 100% bảo mật và dữ liệu nằm trọn vẹn trên thiết bị người dùng.
  - **Ứng dụng PWA:** Service Worker (`sw.js`) hỗ trợ chạy Offline và Web App Manifest (`manifest.json`).

---

## 🎯 II. CÁC YÊU CẦU CỐT LÕI (CORE REQUIREMENTS)

### REQ 1.1: Khung kiến thức theo giáo trình
- Ứng dụng hỗ trợ lộ trình học tiếng Nhật theo giáo trình phổ biến trên internet hiện nay (**Minna no Nihongo từ Bài 1 đến Bài 50**).
- Phân cấp trình độ rõ ràng: Bài 1 - 25 (Sơ cấp N5), Bài 26 - 50 (Trung cấp N4).

### REQ 1.2: Quản lý bài học & Trình soạn thảo ghi chú
- Danh sách bài học ban đầu để trống để người dùng tự do tạo và tổ chức bài học của riêng mình.
- Hỗ trợ tạo bài học mới nhanh theo danh mục bài 1 - 50 hoặc tự đặt tên tùy ý.
- Khi tạo xong, hệ thống tự động mở sang trang soạn thảo ghi chú chuyên dụng:
  - Trình soạn thảo Markdown trực quan với thanh công cụ nhanh (Heading, Bold, Italic, Table, Checklist, Code).
  - Gắn thẻ Tags phân loại và đánh dấu trạng thái bài học (**Đang học** / **Hoàn thành**).
  - Tự động lưu trữ an toàn vào `LocalStorage`.

### REQ 1.3: Trợ lý Sensei AI & Cấu hình Gemini API
- Tích hợp khu vực Chat AI sử dụng Google Gemini API với khóa do người dùng cấu hình:
  - Khóa API được lưu cục bộ trong trình duyệt, không truyền qua bất kỳ server trung gian nào.
  - Kiểm tra kết nối nhanh và miễn phí token qua endpoint `GET /v1beta/models`.
  - **Danh sách Model:** Ban đầu danh sách để trống để người dùng chủ động nạp. Khi bấm nút **"🔄 Tải tất cả Model"**, hệ thống nạp đúng 5 model theo hạn mức:
    1. ⭐ **Gemini 3.5 Flash Lite** *(Khuyên dùng, tốc độ cao, 500 requests/ngày)*
    2. **Gemini 3.1 Flash Lite** *(500 requests/ngày)*
    3. **Gemini 3.5 Flash** *(20 requests/ngày)*
    4. **Gemini 3.6 Flash** *(20 requests/ngày)*
    5. **Gemini 3.7 Flash** *(20 requests/ngày)*
  - Tích hợp cơ chế tự động Fallback chuyển tiếp liền mạch sang `gemini-2.0-flash` / `gemini-1.5-flash` khi cần, đảm bảo không bao giờ bị lỗi gọi model.

### REQ 1.4: Định dạng & Chất lượng Output AI
- **Giới hạn số lượng từ vựng:** Trích xuất có chọn lọc **10 - 15 từ vựng trọng tâm** cho mỗi bài học (tránh output tràn lan 40 - 50 từ gây khó tiếp thu).
- **Phân loại rõ ràng:** Nhóm từ vựng theo từ loại chuẩn: *Danh từ*, *Động từ*, *Tính từ (-i / -na)*, *Phó từ & Cụm từ liên kết*.
- **Hiển thị bảng đẹp mắt (.nihon-table):** Định dạng bảng gồm 5 cột: STT, Từ vựng (Kanji), Cách đọc (Furigana/Hiragana), Hán Việt, Ý nghĩa tiếng Việt.
- **Xử lý Markdown chuẩn:** Bộ lọc tự động làm sạch code fence thô và thụt lề, khắc phục triệt để lỗi biến bảng từ vựng thành thẻ `<pre>` đen.

### REQ 1.5: Xuất & Liên kết dữ liệu ghi chú
- **Nút 📋 Sao chép Notion:** Copy nhanh toàn bộ output của AI dưới định dạng Markdown chuẩn để dán trực tiếp vào ứng dụng Notion mà vẫn giữ nguyên cấu trúc bảng và đề mục.
- **Nút 📥 Lưu vào bài học:** Mở popup cho phép chọn bài học đích và lựa chọn chế độ:
  - *Nối tiếp vào cuối bài (Append - Khuyên dùng).*
  - *Ghi đè toàn bộ nội dung (Overwrite).*

### REQ 1.6: Bộ câu lệnh mẫu nhanh (Quick Prompts)
Tích hợp sẵn các chip gợi ý ngay bên dưới khung chat để người dùng truy vấn nhanh 1 chạm:
1. `📖 Tổng hợp từ vựng & ngữ pháp bài [X]`: Rút trích 10 - 15 từ vựng trọng tâm chia nhóm và các mẫu ngữ pháp chính.
2. `📝 Tổng hợp kiến thức vào bài học vừa tạo`: Tự động nhận diện bối cảnh bài học đang mở để viết nội dung tóm tắt.
3. `🎯 Thêm nội dung luyện tập, bài tập`: Tạo 5 câu trắc nghiệm và điền từ kèm đáp án và giải thích chi tiết.
4. `💡 Giải thích ngữ pháp chuyên sâu`: Phân tích ngữ cảnh sử dụng, sắc thái và 3 câu ví dụ thực tế có dịch nghĩa.
5. `🎬 Tìm video YouTube bài giảng`: Đề xuất các video bài giảng hay nhất trên YouTube kèm link trực tiếp bấm vào được ngay.

---

## ⚡ III. TÍNH NĂNG NÂNG CAO ĐÃ BỔ SUNG (ADVANCED ENHANCEMENTS)

### REQ 2.1: Thanh kéo co giãn kích thước Layout (Resizable Split-View)
- Bổ sung thanh phân cách `#layout-resizer` giữa Cột bài học và Cột Chat AI.
- Người dùng có thể kéo chuột hoặc chạm cảm ứng để phóng to / thu nhỏ khung chat theo ý thích (giới hạn từ 320px đến `calc(100vw - 360px)`).
- Nhấp đúp chuột vào thanh phân cách để khôi phục ngay kích thước mặc định (460px).
- Ghi nhớ độ rộng tùy chỉnh vào `LocalStorage`.

### REQ 2.2: Tạm ẩn / Thu gọn Chat AI (Chế độ xem toàn màn hình bài học)
- Hỗ trợ ẩn tạm thời khung Chat AI trên Desktop và Tablet để không gian bài học và ghi chú mở rộng **100% toàn màn hình**:
  - Nút **`✕`** trên góc phải tiêu đề khung Chat.
  - Nút nổi **`🤖 Hiện Chat AI`** ở góc trên bài học khi đang ẩn.
  - Nút biểu tượng **`🤖`** trên thanh Header.
  - Phím tắt nhanh **`Ctrl + \`** (hoặc `Cmd + \` trên Mac) để chuyển đổi tức thì.
  - Ghi nhớ trạng thái ẩn/hiện trong `LocalStorage`.

### REQ 2.3: Giao diện 2 Tab riêng biệt trên Mobile & Tablet (<= 1024px)
- Thay thế hoàn toàn layout xếp chồng chật chội trên điện thoại bằng thanh điều hướng 2 Tab chuyên nghiệp:
  - **Tab 1:** `📖 Bài học & Ghi chú` (toàn màn hình 100%).
  - **Tab 2:** `🤖 Sensei AI Chat` (toàn màn hình 100%).
- Chuyển tab tự động thông minh khi người dùng bấm lệnh nhanh hoặc mở bài học.
- Chấm đỏ Sakura nhấp nháy trên Tab Chat để báo hiệu khi AI đã tạo xong câu trả lời trong lúc người dùng đang ở Tab Bài học.
- Thanh Header tự động co gọn các nút bấm trên màn hình điện thoại nhỏ ($\le 640px$).

### REQ 2.4: Hỗ trợ Progressive Web App (PWA)
- Nút **"📲 Tải App"** nổi bật trên Header cho phép cài đặt NihonGo AI về máy tính và điện thoại.
- Hoạt động như một ứng dụng độc lập (Standalone mode), không thanh URL, có icon riêng trên Taskbar và Home Screen.
- Service Worker (`sw.js`) lưu bộ đệm tĩnh hỗ trợ chế độ Offline và tải trang tức thì.
- Bộ nhận diện icon thương hiệu cổng Torii chuẩn vector SVG và PNG đa kích thước (192x192, 512x512).

### REQ 2.5: Nút làm mới ứng dụng (F5 Refresh)
- Nút icon xoay tròn **`🔄`** trên Header để tải lại nhanh trang web kèm hiệu ứng animation mượt mà, tối ưu trải nghiệm khi sử dụng dưới dạng ứng dụng cài đặt (PWA).

### REQ 2.6: Hướng dẫn sử dụng trực quan trong ứng dụng
- Nút **`❓`** trên Header mở cửa sổ Modal Hướng dẫn chi tiết gồm 4 bước thiết kế dạng thẻ card hiện đại:
  - *Bước 1: Cấu hình API Key & Chọn Model.*
  - *Bước 2: Tạo & Ghi chú bài học.*
  - *Bước 3: Tương tác với Sensei AI.*
  - *Bước 4: Tiện ích & Phím tắt thông minh.*
- Đi kèm file tài liệu chi tiết `HUONG_DAN_SU_DUNG.md` trong thư mục gốc dự án.

### REQ 2.7: Chế độ giao diện Sáng / Tối (Dark / Light Theme)
- Nút icon **`🌙 / ☀️`** cho phép chuyển đổi tức thì giữa giao diện sáng tinh tế và giao diện tối hiện đại, bảo vệ thị lực khi học tập vào ban đêm.

### REQ 2.8: Tìm kiếm và Đề xuất Video YouTube học tiếng Nhật
- Sensei AI hỗ trợ tìm kiếm bài giảng video tiếng Nhật trên YouTube theo từng bài học Minna no Nihongo hoặc chủ đề ngữ pháp/luyện nghe.
- Tự động cung cấp các link YouTube chuẩn xác dạng nút bấm bắt mắt (`a.youtube-link`) mở trong tab mới, đảm bảo 100% người dùng bấm vào là xem được ngay video chất lượng từ các kênh uy tín (Dũng Mori, Riki Nihongo, Nihongo no Mori...).
