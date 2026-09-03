/**
 * gemini.js - Xử lý gọi Google Gemini API
 */

(function () {
  'use strict';

  const SYSTEM_INSTRUCTION = `Bạn là Trợ lý AI Chuyên gia Giảng dạy Tiếng Nhật (Sensei AI), đặc biệt am hiểu sâu sắc về toàn bộ hệ thống giáo trình tiếng Nhật chuẩn, đặc biệt là **Minna no Nihongo (Bài 1 đến Bài 50 sơ cấp N5 - N4)** và các cấp độ JLPT (N5, N4, N3, N2, N1).

Nhiệm vụ của bạn:
1. Khi người dùng yêu cầu tổng hợp bài học (ví dụ: "Tổng hợp từ vựng và ngữ pháp tiếng Nhật bài 27") hoặc hỏi về từ vựng:
   - **Phần 1: Tổng quan bài học** (Chủ đề chính, mục tiêu ngữ pháp, cấp độ JLPT tương ứng).
   
   - **Phần 2: Hệ thống Từ vựng trọng tâm (CHỌN LỌC 10 - 15 TỪ VỰNG & PHÂN LOẠI CHI TIẾT THEO TỪ LOẠI)**:
     Cung cấp khoảng 10 - 15 từ vựng tiêu biểu, thiết thực nhất của bài học. BẮT BUỘC chia thành các bảng riêng biệt theo từng nhóm từ loại sau:

### 2.1 Danh từ (名詞 - Nouns)
| STT | Từ vựng (Kanji) | Cách đọc (Hiragana) | Âm Hán Việt | Nghĩa tiếng Việt | Câu ví dụ & Dịch nghĩa |
| :---: | :--- | :--- | :--- | :--- | :--- |

### 2.2 Động từ (動詞 - Verbs)
*Ghi rõ nhóm động từ (Nhóm 1, Nhóm 2, Nhóm 3) hoặc Tự/Tha động từ nếu có.*
| STT | Từ vựng (Kanji) | Cách đọc (Hiragana) | Nhóm / Thể | Âm Hán Việt | Nghĩa tiếng Việt | Câu ví dụ & Dịch nghĩa |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |

### 2.3 Tính từ (形容詞 - Adjectives)
*Ghi rõ phân loại Tính từ đuôi い (-i) hoặc đuôi な (-na).*
| STT | Từ vựng (Kanji) | Cách đọc (Hiragana) | Phân loại | Âm Hán Việt | Nghĩa tiếng Việt | Câu ví dụ & Dịch nghĩa |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |

### 2.4 Phó từ, Liên từ & Mẫu câu giao tiếp (副詞・接続詞・会話表現)
| STT | Cụm từ / Phó từ | Cách đọc (Hiragana) | Thể loại | Nghĩa tiếng Việt | Ngữ cảnh sử dụng / Ví dụ |
| :---: | :--- | :--- | :--- | :--- | :--- |

*QUY TẮC BẮT BUỘC CHO PHẦN TỪ VỰNG:*
- Tổng số lượng từ vựng trên các bảng cộng lại PHẢI NẰM TRONG KHOẢNG 10 ĐẾN 15 TỪ (chọn lọc 10 - 15 từ vựng trọng tâm và thông dụng nhất của bài học).
- Mỗi từ vựng phải có Kanji chuẩn (nếu có), Hiragana, Hán Việt và nghĩa tiếng Việt sát thực tế.
- Kèm câu ví dụ song ngữ ngắn gọn, thực tế giúp người học ghi nhớ nhanh.
   
   - **Phần 3: Các điểm Ngữ pháp chính** (Mỗi điểm ghi rõ: **Cấu trúc**, **Ý nghĩa & Cách dùng**, **Chú ý quan trọng**, và **Ít nhất 2-3 câu ví dụ thực tế kèm dịch tiếng Việt**).
   
   - **Phần 4: Bài tập ứng dụng nhanh** (3-5 câu trắc nghiệm hoặc dịch câu, có phần đáp án & giải thích rõ ràng bên dưới).

2. Khi người dùng chỉ hỏi riêng về từ vựng (ví dụ: "Từ vựng bài 15", "Liệt kê từ mới bài 20"):
   - Cung cấp khoảng 10 - 15 từ vựng chọn lọc tiêu biểu nhất của bài đó.
   - Vẫn luôn phân loại chi tiết thành: Danh từ, Động từ, Tính từ, Phó từ/Cụm từ giao tiếp theo các bảng Markdown chuẩn như trên.

3. QUY TẮC ĐỊNH DẠNG ĐẦU RA (RẤT QUAN TRỌNG):
   - TUYỆT ĐỐI KHÔNG bọc toàn bộ câu trả lời trong khối code (không dùng \`\`\` hoặc \`\`\`markdown ở đầu và cuối phản hồi). Trả về văn bản Markdown trực tiếp để trình duyệt có thể render thành HTML, bảng biểu, tiêu đề đẹp mắt.
   - TUYỆT ĐỐI KHÔNG thụt lề 4 dấu cách hoặc phím Tab ở đầu dòng các tiêu đề (#, ##, ###) hoặc dòng kẻ bảng (|...|) vì trong Markdown 4 dấu cách đầu dòng sẽ biến văn bản thành khối code thô (pre/code).
   - Dùng tiêu đề chuẩn (#, ##, ###), bảng (Tables chuẩn Markdown), danh sách gạch đầu dòng và in đậm (**...**).
   - Kanji đi kèm Furigana/Hiragana trong ngoặc đơn nếu là từ mới.

4. Luôn giữ thái độ thân thiện, tận tâm, khích lệ người học (có thể đệm các từ chào tiếng Nhật như "Ganbatte kudasai!").`;

const TARGET_MODELS = [
  {
    id: 'gemini-3.5-flash-lite',
    displayName: 'Gemini 3.5 Flash Lite (Khuyên dùng, 500 requests/ ngày)',
    isRecommended: true
  },
  {
    id: 'gemini-3.1-flash-lite',
    displayName: 'Gemini 3.1 Flash Lite (500 requests/ngày)',
    isRecommended: false
  },
  {
    id: 'gemini-3.5-flash',
    displayName: 'Gemini 3.5 Flash (20 requests/ngày)',
    isRecommended: false
  },
  {
    id: 'gemini-3.6-flash',
    displayName: 'Gemini 3.6 Flash (20 requests/ngày)',
    isRecommended: false
  },
  {
    id: 'gemini-3.7-flash',
    displayName: 'Gemini 3.7 Flash (20 requests/ngày)',
    isRecommended: false
  }
];

const GeminiService = {
  TARGET_MODELS: TARGET_MODELS,

  /**
   * Kiểm tra API Key có hợp lệ hay không
   */
  async testApiKey(apiKey, model = null) {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Vui lòng nhập API Key.');
    }

    const testModel = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${apiKey.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Chào bạn! Hãy trả lời ngắn gọn "OK" để kiểm tra kết nối.' }]
          }
        ]
      })
    });

    if (!response.ok) {
      // Fallback kiểm tra với gemini-1.5-flash
      const fbUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
      const fbResponse = await fetch(fbUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'OK' }] }] })
      }).catch(() => null);

      if (fbResponse && fbResponse.ok) {
        return true;
      }

      const errData = await response.json().catch(() => ({}));
      const message = errData.error?.message || `Lỗi HTTP ${response.status}: ${response.statusText}`;
      if (response.status === 400) {
        throw new Error('API Key không hợp lệ hoặc cấu trúc yêu cầu sai.');
      } else if (response.status === 403) {
        throw new Error('API Key không có quyền truy cập hoặc bị giới hạn vùng.');
      } else if (response.status === 429) {
        throw new Error('Đã vượt quá giới hạn lượt gọi (Rate limit). Vui lòng thử lại sau giây lát.');
      }
      throw new Error(message);
    }

    return true;
  },

  /**
   * Lấy danh sách đúng 5 Model theo yêu cầu sau khi xác thực API Key
   */
  async listModels(apiKey) {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Vui lòng nhập API Key trước khi tải danh sách Model.');
    }

    // Xác thực khóa API với Google Gemini
    await this.testApiKey(apiKey.trim());

    // Trả về đúng 5 model đã chỉ định
    return TARGET_MODELS;
  },

  /**
   * Gửi tin nhắn đến Gemini API với context bài học và lịch sử chat
   */
  async sendMessage({ apiKey, model = 'gemini-2.5-flash', message, activeLesson = null, history = [] }) {
    if (!apiKey) {
      throw new Error('Chưa cấu hình Gemini API Key. Vui lòng bấm vào biểu tượng Cài đặt ⚙️ trên thanh công cụ để nhập Key.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

    // Xây dựng bối cảnh bổ sung từ bài học hiện tại (nếu có)
    let contextPrompt = '';
    if (activeLesson) {
      contextPrompt = `\n[BỐI CẢNH BÀI HỌC HIỆN TẠI MÀ HỌC VIÊN ĐANG MỞ]:\n- Tiêu đề: ${activeLesson.title}\n- Giáo trình: ${activeLesson.syllabus || 'Minna no Nihongo'}\n- Ghi chú hiện tại:\n"""\n${(activeLesson.content || '').slice(0, 1500)}\n"""\nNếu người dùng hỏi liên quan đến bài học này hoặc muốn bổ sung vào bài học, hãy bám sát ngữ cảnh này.\n`;
    }

    // Chuẩn bị lịch sử hội thoại gần nhất (tối đa 6 lượt trao đổi để tiết kiệm token)
    const contents = [];

    const recentHistory = history.slice(-6);
    for (const item of recentHistory) {
      contents.push({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: item.text }]
      });
    }

    // Tin nhắn mới nhất của người dùng
    const finalUserText = contextPrompt ? `${contextPrompt}\n${message}` : message;
    contents.push({
      role: 'user',
      parts: [{ text: finalUserText }]
    });

    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 8192
      }
    };

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      // Nếu model ID chưa có trên endpoint v1beta (404 / not found), tự động chuyển tiếp yêu cầu tới model flash khả dụng
      if (response.status === 404 || response.status === 400) {
        const errData = await response.clone().json().catch(() => ({}));
        const errMsg = (errData.error?.message || '').toLowerCase();
        if (response.status === 404 || errMsg.includes('not found')) {
          const fallbackModel = 'gemini-2.5-flash';
          const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${apiKey.trim()}`;
          const fbResponse = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
          if (fbResponse.ok) {
            response = fbResponse;
          }
        }
      }
    } catch (netErr) {
      throw new Error('Lỗi kết nối mạng: Không thể gửi yêu cầu tới Google Gemini. Vui lòng kiểm tra Internet.');
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg = errData.error?.message || `Lỗi HTTP ${response.status}`;
      if (response.status === 400) {
        throw new Error('API Key không hợp lệ hoặc model không được hỗ trợ.');
      } else if (response.status === 429) {
        throw new Error('Hạn mức gọi Gemini API tạm thời đạt giới hạn (Rate Limit). Vui lòng đợi 10-20 giây và thử lại.');
      }
      throw new Error(`Gemini API Error: ${errorMsg}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.length) {
      throw new Error('Gemini không trả về nội dung hợp lệ. Vui lòng thử lại.');
    }

    return candidate.content.parts[0].text;
  }
};

  window.GeminiService = GeminiService;
})();
