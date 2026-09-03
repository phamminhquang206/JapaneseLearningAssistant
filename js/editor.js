/**
 * editor.js - Quản lý trình soạn thảo ghi chú bài học & Markdown Preview
 */

(function () {
  'use strict';

  class LessonEditor {
  constructor({ containerEl, onSave, onNotification }) {
    this.container = containerEl;
    this.onSave = onSave;
    this.onNotification = onNotification;
    this.currentLesson = null;
    this.saveTimeout = null;
    this.viewMode = 'edit'; // 'edit', 'preview'

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.titleInput = this.container.querySelector('#editor-lesson-title');
    this.syllabusBadge = this.container.querySelector('#editor-lesson-syllabus');
    this.statusSelect = this.container.querySelector('#editor-lesson-status');
    this.textarea = this.container.querySelector('#editor-textarea');
    this.preview = this.container.querySelector('#editor-preview');
    this.saveStatus = this.container.querySelector('#editor-save-indicator');
    this.viewModeBtns = this.container.querySelectorAll('[data-editor-view]');
    this.toolbarBtns = this.container.querySelectorAll('[data-toolbar-action]');
  }

  bindEvents() {
    // Tự động lưu khi gõ nội dung (debounce 600ms)
    this.textarea.addEventListener('input', () => {
      this.renderPreview();
      this.triggerAutoSave();
    });

    // Cập nhật tiêu đề
    this.titleInput.addEventListener('input', () => {
      this.triggerAutoSave();
    });

    // Cập nhật trạng thái bài học (learning / completed)
    if (this.statusSelect) {
      this.statusSelect.addEventListener('change', () => {
        this.triggerAutoSave(true);
      });
    }

    // Chuyển đổi chế độ xem (Split, Edit, Preview)
    this.viewModeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.editorView;
        this.setViewMode(mode);
      });
    });

    // Thanh công cụ soạn thảo (Toolbar buttons)
    this.toolbarBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.toolbarAction;
        this.handleToolbarAction(action);
      });
    });

    // Hỗ trợ phím Tab thụt lề trong textarea
    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        this.textarea.value = this.textarea.value.substring(0, start) + '  ' + this.textarea.value.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
        this.renderPreview();
        this.triggerAutoSave();
      }
    });
  }

  loadLesson(lesson) {
    this.currentLesson = lesson;
    if (!lesson) {
      this.titleInput.value = '';
      this.textarea.value = '';
      this.preview.innerHTML = '<div class="empty-state">Chọn hoặc tạo một bài học để bắt đầu ghi chú.</div>';
      return;
    }

    this.titleInput.value = lesson.title || 'Không có tiêu đề';
    if (this.syllabusBadge) {
      this.syllabusBadge.textContent = lesson.syllabus || 'Minna no Nihongo';
    }
    if (this.statusSelect) {
      this.statusSelect.value = lesson.status || 'learning';
    }
    this.textarea.value = lesson.content || '';
    this.renderPreview();
    this.updateSaveIndicator('Đã đồng bộ');
  }

  renderPreview() {
    const raw = this.textarea.value;
    if (window.MarkdownRenderer) {
      this.preview.innerHTML = window.MarkdownRenderer.render(raw);
    } else if (window.marked) {
      try {
        this.preview.innerHTML = window.marked.parse(raw);
      } catch (err) {
        this.preview.innerText = raw;
      }
    } else {
      this.preview.innerText = raw;
    }
  }

  triggerAutoSave(immediate = false) {
    if (!this.currentLesson) return;

    this.updateSaveIndicator('Đang lưu...');
    clearTimeout(this.saveTimeout);

    const performSave = () => {
      const updatedData = {
        title: this.titleInput.value.trim() || 'Bài học không có tiêu đề',
        content: this.textarea.value,
        status: this.statusSelect ? this.statusSelect.value : (this.currentLesson.status || 'learning')
      };

      if (this.onSave) {
        this.onSave(this.currentLesson.id, updatedData);
      }
      this.updateSaveIndicator('Đã lưu');
    };

    if (immediate) {
      performSave();
    } else {
      this.saveTimeout = setTimeout(performSave, 500);
    }
  }

  updateSaveIndicator(text) {
    if (this.saveStatus) {
      this.saveStatus.textContent = text;
      if (text === 'Đang lưu...') {
        this.saveStatus.classList.add('saving');
      } else {
        this.saveStatus.classList.remove('saving');
      }
    }
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.viewModeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.editorView === mode);
    });

    const workspace = this.container.querySelector('.editor-workspace');
    if (workspace) {
      workspace.className = `editor-workspace mode-${mode}`;
    }
  }

  handleToolbarAction(action) {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const text = this.textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    switch (action) {
      case 'bold':
        replacement = `**${selected || 'chữ đậm'}**`;
        cursorOffset = selected ? replacement.length : 2;
        break;
      case 'italic':
        replacement = `*${selected || 'chữ nghiêng'}*`;
        cursorOffset = selected ? replacement.length : 1;
        break;
      case 'h2':
        replacement = `\n## ${selected || 'Tiêu đề mục'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'h3':
        replacement = `\n### ${selected || 'Tiêu đề phụ'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'list-ul':
        replacement = `\n- ${selected || 'Mục danh sách'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'list-ol':
        replacement = `\n1. ${selected || 'Mục danh sách'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'table':
        replacement = `\n### Danh từ (名詞)\n| STT | Từ vựng | Cách đọc | Hán Việt | Nghĩa tiếng Việt |\n| :--- | :--- | :--- | :--- | :--- |\n| 1 | 日本語 | にほんご | NHẬT BẢN NGỮ | Tiếng Nhật |\n| 2 | 先生 | せんせい | TIÊN SINH | Thầy cô giáo |\n\n### Động từ (動詞)\n| STT | Từ vựng | Cách đọc | Nhóm | Hán Việt | Nghĩa tiếng Việt |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| 1 | 行きます | いきます | Nhóm 1 | HÀNH | Đi |\n| 2 | 食べます | たべます | Nhóm 2 | THỰC | Ăn |\n`;
        cursorOffset = replacement.length;
        break;
      case 'quote':
        replacement = `\n> 💡 **Ghi chú:** ${selected || 'Lưu ý quan trọng cần nhớ...'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'code':
        replacement = selected ? `\`${selected}\`` : '`code`';
        cursorOffset = replacement.length;
        break;
      case 'clear':
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ nội dung ghi chú này không?')) {
          this.textarea.value = '';
          this.renderPreview();
          this.triggerAutoSave(true);
        }
        return;
      default:
        return;
    }

    this.textarea.value = text.substring(0, start) + replacement + text.substring(end);
    this.textarea.focus();
    this.textarea.selectionStart = this.textarea.selectionEnd = start + cursorOffset;
    this.renderPreview();
    this.triggerAutoSave();
  }

  insertContent(newContent, mode = 'append') {
    if (!this.currentLesson) return;

    if (mode === 'append') {
      const current = this.textarea.value.trim();
      const separator = current ? '\n\n---\n\n' : '';
      this.textarea.value = current + separator + newContent.trim() + '\n';
    } else {
      this.textarea.value = newContent.trim() + '\n';
    }

    this.renderPreview();
    this.triggerAutoSave(true);
    if (this.onNotification) {
      this.onNotification('Đã cập nhật nội dung vào bài học!');
    }
  }

  exportMarkdown() {
    if (!this.currentLesson) return;
    const filename = `${(this.currentLesson.title || 'lesson').replace(/[/\\?%*:|"<>]/g, '_')}.md`;
    const blob = new Blob([this.textarea.value], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    if (this.onNotification) {
      this.onNotification(`Đã tải xuống file ${filename}`);
    }
  }

  copyForNotion() {
    if (!this.textarea.value) return;
    navigator.clipboard.writeText(this.textarea.value).then(() => {
      if (this.onNotification) {
        this.onNotification('Đã sao chép toàn bộ bài học định dạng Notion Markdown!');
      }
    }).catch(err => {
      console.error('Không thể copy:', err);
    });
  }
}

  window.LessonEditor = LessonEditor;
})();
