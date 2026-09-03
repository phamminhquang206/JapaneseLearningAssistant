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

3. HỖ TRỢ TÌM KIẾM VIDEO YOUTUBE & ĐƯA RA LINK BẤM ĐƯỢC (RẤT QUAN TRỌNG):
   Khi người dùng yêu cầu tìm video YouTube (ví dụ: "Tìm video bài 27", "video luyện nghe", "video giải thích ngữ pháp bài X trên Youtube", hoặc khi cần minh họa bài học bằng video):
   - Bạn hãy gợi ý và đề xuất các kênh / video học tiếng Nhật uy tín, chất lượng nhất (như Dũng Mori, Riki Nihongo, Tiếng Nhật Đơn Giản, Nihongo no Mori - 日本語の森, Cùng học tiếng Nhật, Akane Japanese...).
   - BẮT BUỘC cung cấp link YouTube trực tiếp có thể bấm vào được bằng cú pháp Markdown:
     [📺 Xem video trên YouTube: <Tiêu đề bài giảng / Kênh>](https://www.youtube.com/results?search_query=<từ_khóa_tìm_kiếm_chuẩn_nối_bằng_dấu_cộng>)
     *Ví dụ mẫu chuẩn:*
     - [📺 Xem video YouTube: Ngữ pháp Minna no Nihongo Bài 27 - Dũng Mori](https://www.youtube.com/results?search_query=ngu+phap+minna+no+nihongo+bai+27+dung+mori)
     - [📺 Xem video YouTube: Luyện nghe tiếng Nhật Minna no Nihongo Bài 27](https://www.youtube.com/results?search_query=luyen+nghe+minna+no+nihongo+bai+27)
     - [📺 Xem video YouTube: Phân biệt Tự động từ và Tha động từ tiếng Nhật](https://www.youtube.com/results?search_query=tu+dong+tu+tha+dong+tu+tieng+nhat)
   - Cung cấp link dạng https://www.youtube.com/results?search_query=... với các từ khóa chuẩn xác là cách tối ưu và ổn định 100%, giúp người dùng bấm vào là mở ngay video chất lượng cao nhất tương ứng mà không bao giờ bị lỗi link hỏng hoặc video bị xóa.
   - Ghi chú thêm tóm tắt ngắn gọn nội dung video sẽ giúp ích gì cho bài học và mẹo luyện tập (ví dụ: nghe lặp lại Shadowing, bật phụ đề song ngữ CC).

4. QUY TẮC ĐỊNH DẠNG ĐẦU RA (RẤT QUAN TRỌNG):
   - TUYỆT ĐỐI KHÔNG bọc toàn bộ câu trả lời trong khối code (không dùng \`\`\` hoặc \`\`\`markdown ở đầu và cuối phản hồi). Trả về văn bản Markdown trực tiếp để trình duyệt có thể render thành HTML, bảng biểu, tiêu đề đẹp mắt.
   - TUYỆT ĐỐI KHÔNG thụt lề 4 dấu cách hoặc phím Tab ở đầu dòng các tiêu đề (#, ##, ###) hoặc dòng kẻ bảng (|...|) vì trong Markdown 4 dấu cách đầu dòng sẽ biến văn bản thành khối code thô (pre/code).
   - Dùng tiêu đề chuẩn (#, ##, ###), bảng (Tables chuẩn Markdown), danh sách gạch đầu dòng và in đậm (**...**).
   - Kanji đi kèm Furigana/Hiragana trong ngoặc đơn nếu là từ mới.
   - TUYỆT ĐỐI KHÔNG sử dụng ký hiệu LaTeX toán học như $\rightarrow$, $\Rightarrow$, \rightarrow, \to khi viết quy tắc ngữ pháp, công thức, cách chia động từ. BẮT BUỘC dùng trực tiếp ký tự mũi tên Unicode chuẩn như: "→", "⇒", "↔" (ví dụ: かきます → かけます, N1 → N2, V1 → V2).

5. Luôn giữ thái độ thân thiện, tận tâm, khích lệ người học (có thể đệm các từ chào tiếng Nhật như "Ganbatte kudasai!").`;

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
   * Kiểm tra API Key có hợp lệ hay không qua endpoint models của Google (nhanh, chuẩn và không tốn token)
   */
  async testApiKey(apiKey, model = null) {
    const key = (apiKey || '').trim();
    if (!key) {
      throw new Error('Vui lòng nhập API Key.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
    let response;
    try {
      response = await fetch(url);
    } catch (netErr) {
      // Nếu lỗi mạng cục bộ hoặc chặn CORS khi chạy qua file://
      console.warn('Lỗi kết nối mạng khi kiểm tra API Key:', netErr);
      return true;
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData.error?.message || `Lỗi HTTP ${response.status}: ${response.statusText}`;
      if (response.status === 400) {
        throw new Error('API Key không hợp lệ. Vui lòng kiểm tra lại khóa API từ Google AI Studio.');
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
    const key = (apiKey || '').trim();
    if (!key) {
      throw new Error('Vui lòng nhập API Key trước khi tải danh sách Model.');
    }

    // Xác thực khóa API với Google Gemini
    await this.testApiKey(key);

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

      // Nếu model ID chưa có trên endpoint v1beta (404 / not found), tự động chuyển tiếp yêu cầu tới model flash khả dụng (gemini-2.0-flash / gemini-1.5-flash)
      if (response.status === 404 || response.status === 400) {
        const errData = await response.clone().json().catch(() => ({}));
        const errMsg = (errData.error?.message || '').toLowerCase();
        if (response.status === 404 || errMsg.includes('not found')) {
          const fallbackCandidates = ['gemini-2.0-flash', 'gemini-1.5-flash'];
          for (const fallbackModel of fallbackCandidates) {
            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${apiKey.trim()}`;
            const fbResponse = await fetch(fallbackUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody)
            }).catch(() => null);
            if (fbResponse && fbResponse.ok) {
              response = fbResponse;
              break;
            }
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

    const rawOutput = candidate.content.parts[0].text || '';
    return cleanLatexSymbols(rawOutput);
  }
};

/**
 * Hàm làm sạch triệt để các ký hiệu LaTeX (như $\rightarrow$, \rightarrow, $\Rightarrow$...)
 * và chuyển đổi thành ký tự Unicode chuẩn (→, ⇒, ...)
 */
function cleanLatexSymbols(text) {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text;

  // 1. Thay thế các biến thể cụ thể của mũi tên và ký hiệu toán học phổ biến (có hoặc không có dấu $)
  cleaned = cleaned
    .replace(/\\rightarrow|\$+\s*\\rightarrow\s*\$+|\\to|\$+\s*\\to\s*\$+/gi, '→')
    .replace(/\\Rightarrow|\$+\s*\\Rightarrow\s*\$+|\\implies|\$+\s*\\implies\s*\$+/gi, '⇒')
    .replace(/\\leftarrow|\$+\s*\\leftarrow\s*\$+/gi, '←')
    .replace(/\\Leftarrow|\$+\s*\\Leftarrow\s*\$+/gi, '⇐')
    .replace(/\\leftrightarrow|\$+\s*\\leftrightarrow\s*\$+/gi, '↔')
    .replace(/\\Leftrightarrow|\$+\s*\\Leftrightarrow\s*\$+|\\iff|\$+\s*\\iff\s*\$+/gi, '⇔')
    .replace(/\\uparrow|\$+\s*\\uparrow\s*\$+/gi, '↑')
    .replace(/\\downarrow|\$+\s*\\downarrow\s*\$+/gi, '↓')
    .replace(/\\dots|\\cdots|\\ldots|\$+\s*\\(?:dots|cdots|ldots)\s*\$+/gi, '...')
    .replace(/\\times|\$+\s*\\times\s*\$+/gi, '×')
    .replace(/\\div|\$+\s*\\div\s*\$+/gi, '÷')
    .replace(/\\approx|\$+\s*\\approx\s*\$+/gi, '≈')
    .replace(/\\neq|\$+\s*\\neq\s*\$+/gi, '≠')
    .replace(/\\le(q)?|\$+\s*\\le(q)?\s*\$+/gi, '≤')
    .replace(/\\ge(q)?|\$+\s*\\ge(q)?\s*\$+/gi, '≥')
    .replace(/\\pm|\$+\s*\\pm\s*\$+/gi, '±')
    .replace(/\\bullet|\$+\s*\\bullet\s*\$+/gi, '•')
    .replace(/\\sim|\$+\s*\\sim\s*\$+/gi, '~');

  // 2. Xử lý các khối LaTeX $ ... $ còn sót lại bao bọc từ hoặc mũi tên
  cleaned = cleaned.replace(/\$([^$]+)\$/g, (match, inner) => {
    const innerCleaned = inner
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\mathrm\{([^}]+)\}/g, '$1')
      .replace(/\\mathbf\{([^}]+)\}/g, '$1')
      .replace(/\\rightarrow|\\to/gi, '→')
      .replace(/\\Rightarrow|\\implies/gi, '⇒')
      .replace(/\\leftarrow/gi, '←')
      .replace(/\\leftrightarrow/gi, '↔');
    return innerCleaned.trim();
  });

  return cleaned;
}

  window.cleanLatexSymbols = cleanLatexSymbols;
  window.GeminiService = GeminiService;
})();
