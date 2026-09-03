/**
 * markdown.js - Bộ tiền xử lý và render Markdown tối ưu cho NihonGo AI
 * 
 * Khắc phục triệt để các vấn đề:
 * 1. AI bọc toàn bộ câu trả lời trong ```markdown ... ``` làm hiển thị thành khối code thô đen xì
 * 2. AI thụt lề 4 dấu cách đầu dòng làm tiêu đề và bảng bị Markdown parser hiểu nhầm là <pre><code>
 * 3. Tự động bọc bảng trong <div class="table-responsive"> để hiển thị đẹp, có bóng đổ, cuộn ngang mượt mà
 * 4. Tự động gắn class nhận diện cột Từ vựng (Kanji), Cách đọc (Hiragana), Hán Việt để định dạng chuyên biệt cho tiếng Nhật
 * 5. Tích hợp bộ parse dự phòng (Fallback Parser) nếu Marked.js chưa tải kịp
 */

(function () {
  'use strict';

  // Cấu hình Marked nếu có sẵn
  function setupMarked() {
    if (typeof window.marked !== 'undefined' && typeof window.marked.setOptions === 'function') {
      try {
        window.marked.setOptions({
          gfm: true,
          breaks: true,
          pedantic: false
        });
      } catch (e) {
        console.warn('Không thể cấu hình marked.setOptions:', e);
      }
    }
  }

  // Khởi chạy ngay khi load
  setupMarked();

  /**
   * Làm sạch văn bản Markdown thô từ AI trước khi đưa vào parser
   */
  function cleanMarkdownText(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';

    let text = rawText.trim();

    // 1. Gỡ bỏ khối code bọc ngoài cùng nếu AI lỡ bao toàn bộ phản hồi trong ```markdown ... ``` hoặc ``` ... ```
    const outerFenceMatch = text.match(/^```(?:markdown|md)?\s*[\r\n]+([\s\S]*?)[\r\n]+```\s*$/i);
    if (outerFenceMatch) {
      text = outerFenceMatch[1].trim();
    } else {
      // Trường hợp AI quên đóng ``` ở cuối hoặc có khoảng trắng thừa
      if (text.startsWith('```markdown\n') || text.startsWith('```markdown\r\n')) {
        text = text.replace(/^```markdown[\r\n]+/, '');
      } else if (text.startsWith('```\n') || text.startsWith('```\r\n')) {
        text = text.replace(/^```[\r\n]+/, '');
      }
      if (text.endsWith('\n```') || text.endsWith('\r\n```')) {
        text = text.replace(/[\r\n]+```$/, '');
      }
    }

    // 2. Gỡ bỏ khoảng trắng thụt lề đầu dòng (2+ khoảng trắng hoặc tab) trước các tiêu đề (#, ##, ###)
    // để tránh bị CommonMark hiểu nhầm là Indented Code Block (<pre><code>)
    text = text.replace(/^[ \t]{2,}(#{1,6}\s)/gm, '$1');

    // 3. Gỡ bỏ khoảng trắng thụt lề đầu dòng trước bảng Markdown (|)
    text = text.replace(/^[ \t]{2,}(\|)/gm, '$1');

    // 4. Chuẩn hóa thụt lề cho danh sách không biến thành code block
    text = text.replace(/^[ \t]{4,}([-*+]\s|\d+\.\s)/gm, '  $1');

    return text;
  }

  /**
   * Bộ Parser dự phòng cơ bản nếu Marked.js bị lỗi hoặc không tải được
   */
  function fallbackParse(text) {
    const lines = text.split(/\r?\n/);
    const htmlParts = [];
    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];
    let inList = false;

    function flushTable() {
      if (!inTable) return;
      let html = '<div class="table-responsive"><table class="nihon-table"><thead><tr>';
      tableHeaders.forEach(th => {
        html += `<th>${formatInline(th)}</th>`;
      });
      html += '</tr></thead><tbody>';
      tableRows.forEach(row => {
        html += '<tr>';
        row.forEach((td, colIdx) => {
          const headerName = tableHeaders[colIdx] || '';
          let colClass = '';
          if (/kanji|từ vựng/i.test(headerName)) colClass = 'col-vocab';
          else if (/cách đọc|hiragana/i.test(headerName)) colClass = 'col-reading';
          else if (/hán việt/i.test(headerName)) colClass = 'col-hanviet';
          else if (/stt/i.test(headerName)) colClass = 'col-stt';
          html += `<td class="${colClass}">${formatInline(td)}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      htmlParts.push(html);
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    }

    function flushList() {
      if (!inList) return;
      htmlParts.push('</ul>');
      inList = false;
    }

    function formatInline(str) {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Kiểm tra dòng bảng
      if (line.startsWith('|') && line.endsWith('|')) {
        flushList();
        const cells = line.slice(1, -1).split('|').map(c => c.trim());
        const isSeparator = cells.every(c => /^:?-+:?$/.test(c));

        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
        } else if (isSeparator) {
          // Bỏ qua dòng separator
        } else {
          tableRows.push(cells);
        }
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Kiểm tra danh sách gạch đầu dòng
      if (/^[-*+]\s+/.test(line)) {
        if (!inList) {
          inList = true;
          htmlParts.push('<ul>');
        }
        htmlParts.push(`<li>${formatInline(line.replace(/^[-*+]\s+/, ''))}</li>`);
        continue;
      } else if (inList) {
        flushList();
      }

      // Tiêu đề
      if (/^#{1,6}\s+/.test(line)) {
        const level = line.match(/^(#{1,6})\s+/)[1].length;
        const headingText = line.replace(/^#{1,6}\s+/, '');
        htmlParts.push(`<h${level}>${formatInline(headingText)}</h${level}>`);
        continue;
      }

      // Dòng kẻ ngang
      if (/^(?:---|\*\*\*|___)$/.test(line)) {
        htmlParts.push('<hr>');
        continue;
      }

      // Dòng trống
      if (line === '') {
        continue;
      }

      // Đoạn văn thông thường
      htmlParts.push(`<p>${formatInline(line)}</p>`);
    }

    flushTable();
    flushList();

    return htmlParts.join('\n');
  }

  /**
   * Hậu xử lý HTML sau khi Marked render
   * - Bọc table trong <div class="table-responsive"> nếu chưa có
   * - Thêm class nihon-table và nhận diện cột cho tiếng Nhật
   */
  function postProcessHtml(html) {
    if (!html) return '';

    // Tạo template ảo trong DOM để query và gán class chuẩn hóa
    const temp = document.createElement('div');
    temp.innerHTML = html;

    const tables = temp.querySelectorAll('table');
    tables.forEach(table => {
      table.classList.add('nihon-table');

      // Nhận diện tên cột từ <th>
      const ths = table.querySelectorAll('thead th');
      const colClasses = [];
      ths.forEach(th => {
        const name = (th.textContent || '').toLowerCase().trim();
        if (/stt/i.test(name)) {
          colClasses.push('col-stt');
          th.classList.add('col-stt');
        } else if (/kanji|từ vựng/i.test(name)) {
          colClasses.push('col-vocab');
          th.classList.add('col-vocab');
        } else if (/cách đọc|hiragana/i.test(name)) {
          colClasses.push('col-reading');
          th.classList.add('col-reading');
        } else if (/hán việt/i.test(name)) {
          colClasses.push('col-hanviet');
          th.classList.add('col-hanviet');
        } else if (/ví dụ|câu ví dụ/i.test(name)) {
          colClasses.push('col-example');
          th.classList.add('col-example');
        } else {
          colClasses.push('');
        }
      });

      // Gán class tương ứng cho từng <td> trong các hàng
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(tr => {
        const tds = tr.querySelectorAll('td');
        tds.forEach((td, idx) => {
          if (colClasses[idx]) {
            td.classList.add(colClasses[idx]);
          }
        });
      });

      // Bọc table trong .table-responsive nếu chưa được bọc
      if (!table.parentElement || !table.parentElement.classList.contains('table-responsive')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });

    return temp.innerHTML;
  }

  const MarkdownRenderer = {
    /**
     * Hàm chính để chuyển chuỗi Markdown sang HTML hiển thị hoàn hảo
     */
    render(rawText) {
      if (!rawText) return '';

      setupMarked();
      const cleanText = cleanMarkdownText(rawText);

      let rawHtml = '';

      if (typeof window.marked !== 'undefined') {
        try {
          if (typeof window.marked.parse === 'function') {
            rawHtml = window.marked.parse(cleanText);
          } else if (typeof window.marked === 'function') {
            rawHtml = window.marked(cleanText);
          }
        } catch (err) {
          console.error('Lỗi khi Marked parse Markdown:', err);
          rawHtml = fallbackParse(cleanText);
        }
      } else {
        // Dự phòng nếu không có Marked
        rawHtml = fallbackParse(cleanText);
      }

      if (!rawHtml) {
        rawHtml = fallbackParse(cleanText);
      }

      return postProcessHtml(rawHtml);
    },

    cleanText(rawText) {
      return cleanMarkdownText(rawText);
    }
  };

  window.MarkdownRenderer = MarkdownRenderer;
})();
