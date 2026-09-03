/**
 * app.js - Trung tâm điều khiển ứng dụng Trợ lý học tiếng Nhật
 */

(function () {
  'use strict';

  const Storage = window.AppStorage;
  const GeminiService = window.GeminiService;
  const LessonEditor = window.LessonEditor;

  class JapaneseLearningApp {
  constructor() {
    this.currentView = 'list'; // 'list' hoặc 'editor'
    this.activeLesson = null;
    this.chatHistory = [];
    this.tempAiContentToSave = ''; // Lưu trữ nội dung AI khi mở modal chọn bài học

    this.initElements();
    this.initLayoutResizer();
    this.initEditor();
    this.bindEvents();
    this.loadInitialState();
  }

  initElements() {
    // Top bar & buttons
    this.btnNewLesson = document.getElementById('btn-new-lesson');
    this.btnRefresh = document.getElementById('btn-refresh');
    this.btnSettings = document.getElementById('btn-settings');
    this.btnThemeToggle = document.getElementById('btn-theme-toggle');
    this.apiKeyStatusBadge = document.getElementById('api-key-status-badge');
    this.btnToggleChat = document.getElementById('btn-toggle-chat');
    this.btnCollapseChat = document.getElementById('btn-collapse-chat');
    this.btnFloatingOpenChat = document.getElementById('btn-floating-open-chat');
    this.isChatCollapsed = false;

    // Main workspace & Resizer
    this.appMain = document.querySelector('.app-main');
    this.panelLeft = document.querySelector('.panel-left');
    this.panelRight = document.querySelector('.panel-right');
    this.layoutResizer = document.getElementById('layout-resizer');

    // Mobile Tab Navigation
    this.mobileTabBar = document.getElementById('mobile-tab-bar');
    this.tabBtnLessons = document.getElementById('tab-btn-lessons');
    this.tabBtnChat = document.getElementById('tab-btn-chat');
    this.chatTabBadge = document.getElementById('chat-tab-badge');
    this.activeMobileTab = 'lessons';

    // Views
    this.lessonListView = document.getElementById('view-lesson-list');
    this.lessonEditorView = document.getElementById('view-lesson-editor');
    this.btnBackToList = document.getElementById('btn-back-to-list');

    // Lesson list controls
    this.lessonsGrid = document.getElementById('lessons-grid');
    this.lessonSearchInput = document.getElementById('lesson-search-input');
    this.statTotalLessons = document.getElementById('stat-total-lessons');
    this.statCompleted = document.getElementById('stat-completed');
    this.statLearning = document.getElementById('stat-learning');

    // AI Chat elements
    this.chatMessagesContainer = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input');
    this.btnSendMessage = document.getElementById('btn-send-message');
    this.btnClearChat = document.getElementById('btn-clear-chat');
    this.chatActiveLessonBadge = document.getElementById('chat-active-lesson-badge');
    this.quickPromptChips = document.querySelectorAll('.quick-chip');
    this.chatLoadingIndicator = document.getElementById('chat-loading');

    // Settings Modal
    this.modalSettings = document.getElementById('modal-settings');
    this.inputApiKey = document.getElementById('input-gemini-key');
    this.selectModel = document.getElementById('select-gemini-model');
    this.btnLoadModels = document.getElementById('btn-load-models');
    this.loadModelsStatus = document.getElementById('load-models-status');
    this.btnTestApiKey = document.getElementById('btn-test-api-key');
    this.btnSaveSettings = document.getElementById('btn-save-settings');
    this.btnCloseSettings = document.getElementById('btn-close-settings');
    this.apiTestResult = document.getElementById('api-test-result');

    // New Lesson Modal
    this.modalNewLesson = document.getElementById('modal-new-lesson');
    this.selectPresetLesson = document.getElementById('select-preset-lesson');
    this.inputLessonNumber = document.getElementById('input-lesson-number');
    this.inputLessonTitle = document.getElementById('input-lesson-title');
    this.inputLessonSyllabus = document.getElementById('input-lesson-syllabus');
    this.btnConfirmCreateLesson = document.getElementById('btn-confirm-create-lesson');
    this.btnCloseNewLesson = document.getElementById('btn-close-new-lesson');

    // Save AI Output to Lesson Modal
    this.modalSaveToLesson = document.getElementById('modal-save-to-lesson');
    this.selectTargetLesson = document.getElementById('select-target-lesson');
    this.previewAiContent = document.getElementById('preview-ai-content');
    this.radioSaveModeAppend = document.getElementById('save-mode-append');
    this.btnConfirmSaveToLesson = document.getElementById('btn-confirm-save-to-lesson');
    this.btnCloseSaveToLesson = document.getElementById('btn-close-save-to-lesson');

    // Help Guide Modal
    this.btnHelp = document.getElementById('btn-help');
    this.modalHelp = document.getElementById('modal-help');
    this.btnCloseHelp = document.getElementById('btn-close-help');
    this.btnConfirmCloseHelp = document.getElementById('btn-confirm-close-help');

    // Toast
    this.toastContainer = document.getElementById('toast-container');
  }

  // --- KÉO THẢ THAY ĐỔI ĐỘ RỘNG KHUNG CHAT AI (RESIZABLE SPLIT-VIEW) ---
  initLayoutResizer() {
    const resizer = this.layoutResizer;
    const rightPanel = this.panelRight;
    const mainContainer = this.appMain;

    if (!resizer || !rightPanel || !mainContainer) return;

    // Khôi phục kích thước lưu từ trước nếu người dùng đã tùy chỉnh
    const savedWidth = Storage.getChatPanelWidth();
    if (savedWidth && window.innerWidth > 1024) {
      const parsed = parseInt(savedWidth, 10);
      if (!isNaN(parsed) && parsed >= 300) {
        const maxWidth = window.innerWidth - 360;
        rightPanel.style.width = `${Math.min(Math.max(parsed, 320), maxWidth)}px`;
      }
    }

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    const onMouseDown = (e) => {
      // Chỉ nhận click chuột trái
      if (e.button !== 0) return;
      if (window.innerWidth <= 1024) return;

      isDragging = true;
      startX = e.clientX;
      startWidth = rightPanel.getBoundingClientRect().width;

      resizer.classList.add('is-resizing');
      document.body.classList.add('is-resizing-layout');

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      // Di chuột sang trái (startX > e.clientX) -> tăng độ rộng khung Chat
      // Di chuột sang phải (startX < e.clientX) -> thu nhỏ khung Chat
      const deltaX = startX - e.clientX;
      let newWidth = startWidth + deltaX;

      const containerWidth = mainContainer.getBoundingClientRect().width;
      const minChatWidth = 320;
      const minLeftWidth = 360;
      const maxChatWidth = Math.max(containerWidth - minLeftWidth - resizer.offsetWidth, minChatWidth);

      if (newWidth < minChatWidth) newWidth = minChatWidth;
      if (newWidth > maxChatWidth) newWidth = maxChatWidth;

      rightPanel.style.width = `${newWidth}px`;
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;

      resizer.classList.remove('is-resizing');
      document.body.classList.remove('is-resizing-layout');

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // Lưu lại độ rộng vào LocalStorage
      const currentWidth = Math.round(rightPanel.getBoundingClientRect().width);
      Storage.setChatPanelWidth(currentWidth);
    };

    // Hỗ trợ sự kiện cảm ứng (Touch Events)
    const onTouchStart = (e) => {
      if (window.innerWidth <= 1024) return;
      const touch = e.touches[0];
      isDragging = true;
      startX = touch.clientX;
      startWidth = rightPanel.getBoundingClientRect().width;

      resizer.classList.add('is-resizing');
      document.body.classList.add('is-resizing-layout');

      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    };

    const onTouchMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const deltaX = startX - touch.clientX;
      let newWidth = startWidth + deltaX;

      const containerWidth = mainContainer.getBoundingClientRect().width;
      const minChatWidth = 320;
      const minLeftWidth = 360;
      const maxChatWidth = Math.max(containerWidth - minLeftWidth - resizer.offsetWidth, minChatWidth);

      if (newWidth < minChatWidth) newWidth = minChatWidth;
      if (newWidth > maxChatWidth) newWidth = maxChatWidth;

      rightPanel.style.width = `${newWidth}px`;
      e.preventDefault();
    };

    const onTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      resizer.classList.remove('is-resizing');
      document.body.classList.remove('is-resizing-layout');

      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);

      const currentWidth = Math.round(rightPanel.getBoundingClientRect().width);
      Storage.setChatPanelWidth(currentWidth);
    };

    // Nhấp đúp chuột để reset về kích thước mặc định (460px)
    resizer.addEventListener('dblclick', () => {
      rightPanel.style.width = '460px';
      Storage.setChatPanelWidth(460);
      this.showToast('Đã khôi phục kích thước khung Chat mặc định.', 'info');
    });

    resizer.addEventListener('mousedown', onMouseDown);
    resizer.addEventListener('touchstart', onTouchStart, { passive: true });
  }

  // --- QUẢN LÝ CHUYỂN ĐỔI 2 TAB RIÊNG BIỆT TRÊN MOBILE & TABLET ---
  switchMobileTab(tabName) {
    this.activeMobileTab = tabName; // 'lessons' | 'chat'
    if (this.appMain) {
      this.appMain.setAttribute('data-active-mobile-tab', tabName);
    }
    if (this.tabBtnLessons && this.tabBtnChat) {
      this.tabBtnLessons.classList.toggle('active', tabName === 'lessons');
      this.tabBtnChat.classList.toggle('active', tabName === 'chat');
    }
    if (tabName === 'chat' && this.chatTabBadge) {
      this.chatTabBadge.classList.add('hidden');
    }
  }

  // --- QUẢN LÝ ẨN / THU GỌN KHUNG CHAT AI TRÊN DESKTOP & TABLET ---
  setChatCollapsed(isCollapsed) {
    this.isChatCollapsed = isCollapsed;
    Storage.setChatCollapsed(isCollapsed);

    if (this.appMain) {
      this.appMain.classList.toggle('chat-collapsed', isCollapsed);
    }
    if (this.btnToggleChat) {
      this.btnToggleChat.classList.toggle('active', !isCollapsed);
      this.btnToggleChat.title = isCollapsed
        ? 'Hiện khung Chat AI (Ctrl + \\)'
        : 'Tạm ẩn khung Chat AI để hiển thị toàn bộ bài học (Ctrl + \\)';
    }

    // Phục hồi kích thước trên desktop khi mở lại
    if (!isCollapsed && window.innerWidth > 1024 && this.panelRight) {
      const savedWidth = Storage.getChatPanelWidth() || 460;
      this.panelRight.style.width = `${savedWidth}px`;
    }
  }

  toggleChatPanel() {
    if (window.innerWidth <= 1024) {
      // Trên mobile/tablet (chế độ tab): chuyển đổi giữa 2 tab
      const nextTab = this.activeMobileTab === 'chat' ? 'lessons' : 'chat';
      this.switchMobileTab(nextTab);
    } else {
      // Trên desktop: bật/tắt class chat-collapsed
      const currentlyCollapsed = this.appMain.classList.contains('chat-collapsed');
      this.setChatCollapsed(!currentlyCollapsed);
      this.showToast(currentlyCollapsed ? 'Đã hiển thị lại khung Chat AI' : 'Đã ẩn Chat AI (Xem toàn màn hình bài học)', 'info');
    }
  }

  initEditor() {
    this.editor = new LessonEditor({
      containerEl: this.lessonEditorView,
      onSave: (id, data) => {
        Storage.updateLesson(id, data);
        this.renderLessonList();
        this.updateHeaderActiveBadge();
      },
      onNotification: (msg) => {
        this.showToast(msg, 'success');
      }
    });

    // Nút xuất Markdown & Copy Notion từ thanh toolbar editor
    const btnExportMd = document.getElementById('btn-editor-export-md');
    if (btnExportMd) {
      btnExportMd.addEventListener('click', () => this.editor.exportMarkdown());
    }

    const btnCopyNotion = document.getElementById('btn-editor-copy-notion');
    if (btnCopyNotion) {
      btnCopyNotion.addEventListener('click', () => this.editor.copyForNotion());
    }
  }

  bindEvents() {
    // Điều hướng views
    if (this.btnBackToList) {
      this.btnBackToList.addEventListener('click', () => this.switchView('list'));
    }

    // Modal tạo bài học
    if (this.btnNewLesson) {
      this.btnNewLesson.addEventListener('click', () => this.openNewLessonModal());
    }
    if (this.btnCloseNewLesson) {
      this.btnCloseNewLesson.addEventListener('click', () => this.closeModal(this.modalNewLesson));
    }
    if (this.btnConfirmCreateLesson) {
      this.btnConfirmCreateLesson.addEventListener('click', () => this.handleCreateNewLesson());
    }

    // Modal Cài đặt
    if (this.btnSettings) {
      this.btnSettings.addEventListener('click', () => this.openSettingsModal());
    }
    if (this.apiKeyStatusBadge) {
      this.apiKeyStatusBadge.addEventListener('click', () => this.openSettingsModal());
    }
    if (this.btnCloseSettings) {
      this.btnCloseSettings.addEventListener('click', () => this.closeModal(this.modalSettings));
    }
    if (this.btnLoadModels) {
      this.btnLoadModels.addEventListener('click', () => this.handleLoadModels());
    }
    if (this.btnTestApiKey) {
      this.btnTestApiKey.addEventListener('click', () => this.handleTestApiKey());
    }
    if (this.btnSaveSettings) {
      this.btnSaveSettings.addEventListener('click', () => this.handleSaveSettings());
    }

    // Modal Lưu vào bài học
    if (this.btnCloseSaveToLesson) {
      this.btnCloseSaveToLesson.addEventListener('click', () => this.closeModal(this.modalSaveToLesson));
    }
    if (this.btnConfirmSaveToLesson) {
      this.btnConfirmSaveToLesson.addEventListener('click', () => this.handleConfirmSaveToLesson());
    }

    // Chọn bài học mẫu trong modal tạo mới
    if (this.selectPresetLesson) {
      this.selectPresetLesson.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'custom') {
          this.inputLessonNumber.value = '';
          this.inputLessonTitle.value = '';
        } else if (val) {
          const num = parseInt(val, 10);
          this.inputLessonNumber.value = num;
          this.inputLessonTitle.value = `Bài ${num}: Giáo trình Minna no Nihongo`;
        }
      });
    }

    // Tìm kiếm bài học
    if (this.lessonSearchInput) {
      this.lessonSearchInput.addEventListener('input', () => this.renderLessonList());
    }

    // Chat AI Events
    if (this.btnSendMessage) {
      this.btnSendMessage.addEventListener('click', () => this.handleSendChatMessage());
    }
    if (this.chatInput) {
      this.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendChatMessage();
        }
      });
      // Tự co giãn chiều cao textarea
      this.chatInput.addEventListener('input', () => {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
      });
    }

    if (this.btnClearChat) {
      this.btnClearChat.addEventListener('click', () => {
        if (confirm('Bạn muốn xóa lịch sử trò chuyện AI này?')) {
          this.chatHistory = [];
          Storage.clearChatHistory();
          this.renderChatMessages();
          this.showToast('Đã làm mới đoạn chat!', 'info');
        }
      });
    }

    // Quick prompt chips
    this.quickPromptChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const template = e.currentTarget.dataset.promptTemplate;
        this.applyQuickPrompt(template);
      });
    });

    // Nút làm mới ứng dụng (F5 Refresh)
    if (this.btnRefresh) {
      this.btnRefresh.addEventListener('click', () => {
        this.btnRefresh.classList.add('is-refreshing');
        this.showToast('Đang làm mới trang (F5)...', 'info');
        setTimeout(() => {
          window.location.reload();
        }, 200);
      });
    }

    // Chuyển đổi Dark / Light Theme
    if (this.btnThemeToggle) {
      this.btnThemeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Hướng dẫn sử dụng Modal
    if (this.btnHelp) {
      this.btnHelp.addEventListener('click', () => this.openModal(this.modalHelp));
    }
    if (this.btnCloseHelp) {
      this.btnCloseHelp.addEventListener('click', () => this.closeModal(this.modalHelp));
    }
    if (this.btnConfirmCloseHelp) {
      this.btnConfirmCloseHelp.addEventListener('click', () => this.closeModal(this.modalHelp));
    }

    // Điều hướng 2 Tab trên Mobile
    if (this.tabBtnLessons) {
      this.tabBtnLessons.addEventListener('click', () => this.switchMobileTab('lessons'));
    }
    if (this.tabBtnChat) {
      this.tabBtnChat.addEventListener('click', () => this.switchMobileTab('chat'));
    }

    // Bật/Tắt ẩn hiện Chat AI (Desktop & Mobile)
    if (this.btnToggleChat) {
      this.btnToggleChat.addEventListener('click', () => this.toggleChatPanel());
    }
    if (this.btnCollapseChat) {
      this.btnCollapseChat.addEventListener('click', () => {
        this.setChatCollapsed(true);
        this.showToast('Đã tạm ẩn Chat AI. Nhấn "Hiện Chat AI" hoặc icon 🤖 để mở lại.', 'info');
      });
    }
    if (this.btnFloatingOpenChat) {
      this.btnFloatingOpenChat.addEventListener('click', () => {
        this.setChatCollapsed(false);
      });
    }

    // Phím tắt Ctrl + \ hoặc F2 để ẩn/hiện nhanh Chat AI
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        this.toggleChatPanel();
      }
    });

    // Đóng modal khi click ra ngoài overlay
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeModal(e.target);
      }
    });
  }

  loadInitialState() {
    // Theme
    const savedTheme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    // Cập nhật trạng thái API Key
    this.updateApiKeyBadge();

    // Populate danh sách preset bài 1 - 50 cho modal
    this.populatePresetLessons();

    // Load Chat History
    this.chatHistory = Storage.getChatHistory();
    if (this.chatHistory.length === 0) {
      // Tin nhắn chào mừng ban đầu
      this.chatHistory.push({
        role: 'model',
        text: `Konnichiwa! 👋 Tôi là **Sensei AI** - Trợ lý học tiếng Nhật của bạn.\n\nTôi có thể giúp bạn:\n- 📖 **Tổng hợp từ vựng & ngữ pháp** các bài học trong giáo trình Minna no Nihongo (Bài 1 đến 50) với **10 - 15 từ vựng chọn lọc** được phân loại chi tiết (Danh từ, Động từ, Tính từ, Phó từ/Cụm từ...).\n- 📋 **Sao chép sang Notion** hoặc **lưu trực tiếp vào trang ghi chú** của bạn chỉ bằng một cú nhấp chuột.\n- 🎯 **Tạo bài tập trắc nghiệm & điền từ** kèm đáp án và giải thích chi tiết.\n\n*Hãy thử bấm một trong các gợi ý lệnh nhanh bên dưới để bắt đầu ngay!*`
      });
    }
    this.renderChatMessages();

    // Render danh sách bài học
    this.renderLessonList();

    // Khởi tạo tab di động ban đầu
    this.switchMobileTab('lessons');

    // Khôi phục trạng thái ẩn Chat AI trên Desktop nếu người dùng đã ẩn từ trước
    if (window.innerWidth > 1024 && Storage.isChatCollapsed()) {
      this.setChatCollapsed(true);
    }

    // Kiểm tra xem có bài học đang mở sẵn không
    const activeLessonId = Storage.getActiveLessonId();
    if (activeLessonId) {
      const lesson = Storage.getLesson(activeLessonId);
      if (lesson) {
        this.openLessonEditor(lesson, false);
      } else {
        this.switchView('list');
      }
    } else {
      this.switchView('list');
    }
  }

  populatePresetLessons() {
    if (!this.selectPresetLesson) return;
    this.selectPresetLesson.innerHTML = `
      <option value="">-- Chọn bài học theo Minna no Nihongo (1 - 50) --</option>
    `;
    for (let i = 1; i <= 50; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      const level = i <= 25 ? 'Sơ cấp N5' : 'Trung cấp N4';
      opt.textContent = `Bài ${i} (${level})`;
      this.selectPresetLesson.appendChild(opt);
    }
    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = '✏️ Tự đặt tên bài học tùy ý';
    this.selectPresetLesson.appendChild(customOpt);
  }

  switchView(viewName) {
    this.currentView = viewName;
    if (viewName === 'list') {
      this.lessonListView.classList.remove('hidden');
      this.lessonEditorView.classList.add('hidden');
      Storage.setActiveLessonId(null);
      this.activeLesson = null;
      this.updateHeaderActiveBadge();
    } else {
      this.lessonListView.classList.add('hidden');
      this.lessonEditorView.classList.remove('hidden');
    }
  }

  renderLessonList() {
    const lessons = Storage.getLessons();
    const query = (this.lessonSearchInput ? this.lessonSearchInput.value : '').toLowerCase().trim();

    const filtered = lessons.filter(l => {
      const matchTitle = (l.title || '').toLowerCase().includes(query);
      const matchSyllabus = (l.syllabus || '').toLowerCase().includes(query);
      const matchContent = (l.content || '').toLowerCase().includes(query);
      return matchTitle || matchSyllabus || matchContent;
    });

    // Thống kê
    if (this.statTotalLessons) this.statTotalLessons.textContent = lessons.length;
    if (this.statCompleted) this.statCompleted.textContent = lessons.filter(l => l.status === 'completed').length;
    if (this.statLearning) this.statLearning.textContent = lessons.filter(l => l.status === 'learning').length;

    if (!this.lessonsGrid) return;
    this.lessonsGrid.innerHTML = '';

    if (filtered.length === 0) {
      const isSearching = !!query;
      this.lessonsGrid.innerHTML = `
        <div class="empty-lessons-box">
          <div class="empty-icon">⛩️</div>
          <h3>${isSearching ? 'Không tìm thấy bài học phù hợp' : 'Chưa có bài học nào'}</h3>
          <p>${isSearching ? 'Hãy thử tìm kiếm với từ khóa khác hoặc tạo bài học mới.' : 'Danh sách bài học đang trống. Hãy tạo bài học đầu tiên để bắt đầu ghi chú nhé!'}</p>
          <button type="button" class="btn-primary btn-empty-create" style="margin-top: 14px; gap: 6px;">
            <span>🌸</span>
            <span>Tạo bài học mới ngay</span>
          </button>
        </div>
      `;
      const btnEmpty = this.lessonsGrid.querySelector('.btn-empty-create');
      if (btnEmpty) {
        btnEmpty.addEventListener('click', () => this.openNewLessonModal());
      }
      return;
    }

    filtered.forEach(lesson => {
      const card = document.createElement('div');
      card.className = `lesson-card status-${lesson.status || 'learning'}`;

      const updatedDate = new Date(lesson.updatedAt || lesson.createdAt).toLocaleDateString('vi-VN');
      const isCompleted = lesson.status === 'completed';

      card.innerHTML = `
        <div class="lesson-card-header">
          <span class="lesson-syllabus-badge">${lesson.syllabus || 'Minna no Nihongo'}</span>
          <span class="lesson-status-pill ${isCompleted ? 'completed' : 'learning'}">
            ${isCompleted ? '✓ Hoàn thành' : '● Đang học'}
          </span>
        </div>
        <h3 class="lesson-card-title">${this.escapeHtml(lesson.title)}</h3>
        <p class="lesson-card-preview">${this.cleanPreviewText(lesson.content)}</p>
        <div class="lesson-card-footer">
          <span class="lesson-date"><i class="icon">📅</i> ${updatedDate}</span>
          <div class="lesson-card-actions">
            <button class="btn-icon btn-card-delete" title="Xóa bài học" data-lesson-id="${lesson.id}">
              🗑️
            </button>
            <button class="btn-card-open" data-lesson-id="${lesson.id}">
              Mở ghi chú →
            </button>
          </div>
        </div>
      `;

      // Event click mở bài học
      card.querySelector('.btn-card-open').addEventListener('click', () => {
        this.openLessonEditor(lesson);
      });

      // Click vào cả card cũng mở
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.lesson-card-actions')) {
          this.openLessonEditor(lesson);
        }
      });

      // Event xóa bài học
      card.querySelector('.btn-card-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Bạn có chắc muốn xóa "${lesson.title}" không?`)) {
          Storage.deleteLesson(lesson.id);
          this.renderLessonList();
          this.showToast('Đã xóa bài học.', 'info');
        }
      });

      this.lessonsGrid.appendChild(card);
    });
  }

  cleanPreviewText(content) {
    if (!content) return 'Chưa có ghi chú...';
    return content
      .replace(/[#*`_>\[\]]/g, '')
      .slice(0, 110) + '...';
  }

  openLessonEditor(lesson, shouldSwitchView = true) {
    this.activeLesson = lesson;
    Storage.setActiveLessonId(lesson.id);
    this.editor.loadLesson(lesson);
    if (shouldSwitchView) {
      this.switchView('editor');
    }
    this.updateHeaderActiveBadge();
    if (shouldSwitchView && window.innerWidth <= 1024) {
      this.switchMobileTab('lessons');
    }
  }

  updateHeaderActiveBadge() {
    if (this.chatActiveLessonBadge) {
      if (this.activeLesson) {
        this.chatActiveLessonBadge.innerHTML = `Đang liên kết: <strong>${this.escapeHtml(this.activeLesson.title)}</strong>`;
        this.chatActiveLessonBadge.classList.remove('hidden');
      } else {
        this.chatActiveLessonBadge.innerHTML = `Chưa chọn bài học (AI trả lời tổng quan)`;
        this.chatActiveLessonBadge.classList.add('hidden');
      }
    }
  }

  // --- MODAL TẠO BÀI HỌC (REQ 1.2) ---
  openNewLessonModal() {
    this.selectPresetLesson.value = '';
    this.inputLessonNumber.value = '';
    this.inputLessonTitle.value = '';
    this.inputLessonSyllabus.value = 'Minna no Nihongo';
    this.openModal(this.modalNewLesson);
  }

  handleCreateNewLesson() {
    const title = this.inputLessonTitle.value.trim();
    if (!title) {
      alert('Vui lòng nhập tên bài học!');
      return;
    }

    const lessonNumber = parseInt(this.inputLessonNumber.value, 10) || null;
    const syllabus = this.inputLessonSyllabus.value.trim() || 'Minna no Nihongo';

    // Khởi tạo nội dung mẫu chuẩn giáo trình
    const initialContent = `# ${title}

## 1. Từ vựng mới (ことば)
### 1.1 Danh từ (名詞)
| STT | Từ vựng | Cách đọc | Hán Việt | Nghĩa tiếng Việt |
| :--- | :--- | :--- | :--- | :--- |
| 1 | | | | |

### 1.2 Động từ (動詞)
| STT | Từ vựng | Cách đọc | Nhóm | Hán Việt | Nghĩa tiếng Việt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | | | | | |

### 1.3 Tính từ & Khác (形容詞・その他)
| STT | Từ vựng | Cách đọc | Phân loại | Hán Việt | Nghĩa tiếng Việt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | | | | | |

---

## 2. Cấu trúc Ngữ pháp (ぶんぽう)
### Cấu trúc 1:
- **Ý nghĩa:**
- **Ví dụ:**

---

## 3. Ghi chú cá nhân
- *Thêm ghi chú của bạn tại đây...*
`;

    const newLesson = Storage.createLesson({
      title,
      lessonNumber,
      syllabus,
      content: initialContent,
      tags: lessonNumber ? [`Bài ${lessonNumber}`, syllabus] : [syllabus]
    });

    this.closeModal(this.modalNewLesson);
    this.renderLessonList();

    // REQ 1.2: "Khi ấn tạo xong, thì sẽ hiện 1 trang mới để ghi chú"
    this.openLessonEditor(newLesson, true);
    this.showToast(`Đã tạo bài học: ${title}!`, 'success');
  }

  // --- MODAL CÀI ĐẶT API KEY (REQ 1.3) ---
  populateTargetModels(selectedModelId = null) {
    const models = GeminiService.TARGET_MODELS || [];
    this.selectModel.innerHTML = '';

    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.displayName;
      if (m.id === selectedModelId || (!selectedModelId && m.isRecommended)) {
        opt.selected = true;
      }
      this.selectModel.appendChild(opt);
    });
  }

  openSettingsModal() {
    this.inputApiKey.value = Storage.getApiKey();
    const savedModel = Storage.getModel();

    // Mới đầu không có model nào sẵn; chỉ hiện nếu người dùng đã từng tải và lưu model trước đó
    if (savedModel) {
      this.populateTargetModels(savedModel);
      this.selectModel.value = savedModel;
    } else {
      this.selectModel.innerHTML = '<option value="" disabled selected>-- Chưa có model (Vui lòng bấm "Tải tất cả Model") --</option>';
    }

    this.apiTestResult.textContent = '';
    this.apiTestResult.className = 'api-test-result';
    if (this.loadModelsStatus) {
      this.loadModelsStatus.textContent = '';
    }
    this.openModal(this.modalSettings);
  }

  async handleLoadModels() {
    const key = this.inputApiKey.value.trim();
    if (!key) {
      if (this.loadModelsStatus) {
        this.loadModelsStatus.textContent = '❌ Vui lòng nhập API Key trước khi tải danh sách Model.';
        this.loadModelsStatus.style.color = 'var(--danger)';
      }
      return;
    }

    if (this.btnLoadModels) {
      this.btnLoadModels.disabled = true;
      this.btnLoadModels.textContent = '⏳ Đang tải...';
    }
    if (this.loadModelsStatus) {
      this.loadModelsStatus.textContent = 'Đang kiểm tra API Key và nạp 5 model...';
      this.loadModelsStatus.style.color = 'var(--primary)';
    }

    try {
      const models = await GeminiService.listModels(key);
      const savedModel = Storage.getModel();
      this.populateTargetModels(savedModel || 'gemini-3.5-flash-lite');

      if (this.loadModelsStatus) {
        this.loadModelsStatus.textContent = `✅ Đã tải thành công ${models.length} model khả dụng!`;
        this.loadModelsStatus.style.color = 'var(--success)';
      }
      this.showToast(`Đã tải thành công ${models.length} model!`, 'success');
    } catch (err) {
      // Vẫn nạp danh sách 5 model để người dùng có thể lựa chọn và lưu lại
      const savedModel = Storage.getModel();
      this.populateTargetModels(savedModel || 'gemini-3.5-flash-lite');

      if (this.loadModelsStatus) {
        this.loadModelsStatus.textContent = `⚠️ ${err.message}`;
        this.loadModelsStatus.style.color = 'var(--warning)';
      }
      this.showToast(err.message, 'warning');
    } finally {
      if (this.btnLoadModels) {
        this.btnLoadModels.disabled = false;
        this.btnLoadModels.textContent = '🔄 Tải tất cả Model';
      }
    }
  }

  async handleTestApiKey() {
    const key = this.inputApiKey.value.trim();
    const model = this.selectModel.value;
    if (!key) {
      this.apiTestResult.textContent = '❌ Vui lòng nhập API Key trước khi kiểm tra.';
      this.apiTestResult.className = 'api-test-result error';
      return;
    }

    this.apiTestResult.textContent = '⏳ Đang kiểm tra kết nối với Google Gemini...';
    this.apiTestResult.className = 'api-test-result testing';
    this.btnTestApiKey.disabled = true;

    try {
      await GeminiService.testApiKey(key, model);
      this.apiTestResult.textContent = '✅ Kết nối thành công! API Key hợp lệ.';
      this.apiTestResult.className = 'api-test-result success';
    } catch (err) {
      this.apiTestResult.textContent = `❌ ${err.message}`;
      this.apiTestResult.className = 'api-test-result error';
    } finally {
      this.btnTestApiKey.disabled = false;
    }
  }

  handleSaveSettings() {
    const key = this.inputApiKey.value.trim();
    const model = this.selectModel.value;

    if (!key) {
      this.showToast('Vui lòng nhập API Key.', 'error');
      return;
    }

    if (!model) {
      this.showToast('Vui lòng bấm "Tải tất cả Model" để chọn một model trước khi lưu.', 'error');
      if (this.loadModelsStatus) {
        this.loadModelsStatus.textContent = '⚠️ Vui lòng bấm "Tải tất cả Model" để chọn một model.';
        this.loadModelsStatus.style.color = 'var(--warning)';
      }
      return;
    }

    Storage.setApiKey(key);
    Storage.setModel(model);
    this.updateApiKeyBadge();
    this.closeModal(this.modalSettings);
    this.showToast('Đã lưu cấu hình API thành công!', 'success');
  }

  updateApiKeyBadge() {
    const key = Storage.getApiKey();
    if (this.apiKeyStatusBadge) {
      if (key) {
        this.apiKeyStatusBadge.className = 'api-badge ready';
        this.apiKeyStatusBadge.innerHTML = `● Gemini AI: <span>Đã kết nối</span>`;
        this.apiKeyStatusBadge.title = 'API Key đã sẵn sàng';
      } else {
        this.apiKeyStatusBadge.className = 'api-badge missing';
        this.apiKeyStatusBadge.innerHTML = `○ Gemini AI: <span>Chưa cấu hình</span>`;
        this.apiKeyStatusBadge.title = 'Bấm để nhập API Key';
      }
    }
  }

  // --- AI CHAT & QUICK PROMPTS (REQ 1.4, 1.6) ---
  applyQuickPrompt(template) {
    let promptText = '';
    const activeNumber = this.activeLesson?.lessonNumber;

    if (template === 'summary-lesson') {
      const lessonNum = activeNumber || prompt('Nhập số bài học muốn tổng hợp (ví dụ: 27):', '27');
      if (!lessonNum) return;
      promptText = `Tổng hợp từ vựng (chọn lọc 10-15 từ trọng tâm, phân loại chi tiết Danh từ, Động từ, Tính từ, Phó từ) và ngữ pháp tiếng Nhật bài ${lessonNum}`;
    } else if (template === 'summarize-to-active') {
      if (this.activeLesson) {
        promptText = `Hãy tổng hợp đầy đủ kiến thức trọng tâm cho bài học "${this.activeLesson.title}" (khoảng 10-15 từ vựng trọng tâm phân loại theo nhóm Danh từ, Động từ, Tính từ... và ngữ pháp đầy đủ) để tôi ghi chú vào trang bài học.`;
      } else {
        promptText = `Tổng hợp kiến thức trọng tâm vào trang bài học tiếng Nhật vừa tạo (khoảng 10-15 từ vựng trọng tâm phân loại chi tiết theo từ loại và ngữ pháp).`;
      }
    } else if (template === 'exercises') {
      const lessonInfo = this.activeLesson ? `bài học "${this.activeLesson.title}"` : 'kiến thức vừa học';
      promptText = `Thêm nội dung luyện tập, bài tập trắc nghiệm và điền từ cho ${lessonInfo}, có kèm đáp án và giải thích chi tiết.`;
    } else if (template === 'grammar-explain') {
      promptText = `Giải thích chuyên sâu các điểm ngữ pháp trọng tâm và đặt 3 câu ví dụ thực tế có dịch nghĩa.`;
    }

    if (promptText) {
      this.chatInput.value = promptText;
      this.chatInput.focus();
      this.chatInput.style.height = 'auto';
      this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
      if (window.innerWidth <= 1024) {
        this.switchMobileTab('chat');
      } else if (this.isChatCollapsed) {
        this.setChatCollapsed(false);
      }
      this.handleSendChatMessage();
    }
  }

  async handleSendChatMessage() {
    const text = this.chatInput.value.trim();
    if (!text) return;

    const apiKey = Storage.getApiKey();
    if (!apiKey) {
      this.showToast('Vui lòng cấu hình Gemini API Key trước!', 'error');
      this.openSettingsModal();
      return;
    }

    // Thêm tin nhắn user vào lịch sử
    this.chatHistory.push({
      role: 'user',
      text: text
    });
    this.renderChatMessages();

    // Reset input
    this.chatInput.value = '';
    this.chatInput.style.height = 'auto';

    // Hiện loading
    this.showChatLoading(true);

    try {
      const model = Storage.getModel() || 'gemini-3.5-flash-lite';
      const aiResponseText = await GeminiService.sendMessage({
        apiKey,
        model,
        message: text,
        activeLesson: this.activeLesson,
        history: this.chatHistory.slice(0, -1) // lịch sử trước đó
      });

      // Thêm tin nhắn AI vào lịch sử
      this.chatHistory.push({
        role: 'model',
        text: aiResponseText
      });

      // Nếu đang ở màn hình mobile và người dùng ở tab Bài học, hiển thị chấm thông báo trên tab Chat
      if (this.activeMobileTab !== 'chat' && this.chatTabBadge) {
        this.chatTabBadge.classList.remove('hidden');
      }

      Storage.saveChatHistory(this.chatHistory);
      this.renderChatMessages();
    } catch (err) {
      console.error('Lỗi Gemini Chat:', err);
      this.chatHistory.push({
        role: 'model',
        text: `⚠️ **Đã xảy ra lỗi:** ${err.message}\n\n*Gợi ý:* Hãy kiểm tra lại API Key trong phần Cài đặt ⚙️ hoặc thử lại sau vài giây.`
      });
      this.renderChatMessages();
      this.showToast(err.message, 'error');
    } finally {
      this.showChatLoading(false);
    }
  }

  renderChatMessages() {
    if (!this.chatMessagesContainer) return;
    this.chatMessagesContainer.innerHTML = '';

    this.chatHistory.forEach((msg, idx) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`;

      if (msg.role === 'user') {
        msgDiv.innerHTML = `
          <div class="message-bubble user-bubble">
            <div class="message-content">${this.escapeHtml(msg.text)}</div>
          </div>
        `;
      } else {
        // AI Message: Render markdown chuẩn đẹp và kèm nút chức năng Copy Notion & Lưu vào bài học (REQ 1.5)
        let formattedHtml = '';
        if (window.MarkdownRenderer) {
          formattedHtml = window.MarkdownRenderer.render(msg.text);
        } else if (window.marked) {
          try {
            formattedHtml = window.marked.parse(msg.text);
          } catch {
            formattedHtml = `<div class="raw-fallback">${this.escapeHtml(msg.text)}</div>`;
          }
        } else {
          formattedHtml = `<div class="raw-fallback">${this.escapeHtml(msg.text)}</div>`;
        }

        msgDiv.innerHTML = `
          <div class="ai-avatar">⛩️</div>
          <div class="message-bubble ai-bubble">
            <div class="message-content markdown-body">${formattedHtml}</div>
            <div class="message-actions">
              <button class="btn-action-copy-notion" data-index="${idx}" title="Sao chép chuẩn Markdown để dán vào Notion">
                📋 Copy cho Notion
              </button>
              <button class="btn-action-save-lesson" data-index="${idx}" title="Lưu nội dung này vào bài học của bạn">
                💾 Lưu vào bài học
              </button>
            </div>
          </div>
        `;

        // Event nút "📋 Copy cho Notion"
        msgDiv.querySelector('.btn-action-copy-notion').addEventListener('click', () => {
          this.copyToNotion(msg.text);
        });

        // Event nút "💾 Lưu vào bài học"
        msgDiv.querySelector('.btn-action-save-lesson').addEventListener('click', () => {
          this.openSaveToLessonModal(msg.text);
        });
      }

      this.chatMessagesContainer.appendChild(msgDiv);
    });

    // Cuộn xuống cuối
    this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;
  }

  showChatLoading(isLoading) {
    if (this.chatLoadingIndicator) {
      this.chatLoadingIndicator.classList.toggle('hidden', !isLoading);
    }
    if (this.btnSendMessage) {
      this.btnSendMessage.disabled = isLoading;
    }
    if (isLoading) {
      this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;
    }
  }

  // --- REQ 1.5: COPY CHO NOTION & LƯU VÀO BÀI HỌC ---
  copyToNotion(rawMarkdown) {
    const textToCopy = window.MarkdownRenderer?.cleanText ? window.MarkdownRenderer.cleanText(rawMarkdown) : rawMarkdown;
    navigator.clipboard.writeText(textToCopy).then(() => {
      this.showToast('📋 Đã sao chép nội dung chuẩn Notion vào clipboard!', 'success');
    }).catch(err => {
      console.error('Không thể sao chép:', err);
      this.showToast('Lỗi khi sao chép vào bộ nhớ tạm.', 'error');
    });
  }

  openSaveToLessonModal(contentToSave) {
    this.tempAiContentToSave = contentToSave;
    const lessons = Storage.getLessons();

    if (lessons.length === 0) {
      if (confirm('Bạn chưa có bài học nào. Bạn có muốn tạo bài học mới ngay bây giờ không?')) {
        this.openNewLessonModal();
      }
      return;
    }

    // Đổ danh sách bài học vào dropdown
    this.selectTargetLesson.innerHTML = '';
    lessons.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.textContent = `${l.title} (${l.syllabus || 'Minna no Nihongo'})`;
      if (this.activeLesson && this.activeLesson.id === l.id) {
        opt.selected = true;
      }
      this.selectTargetLesson.appendChild(opt);
    });

    // Preview nội dung
    this.previewAiContent.textContent = contentToSave.slice(0, 300) + (contentToSave.length > 300 ? '...' : '');

    this.openModal(this.modalSaveToLesson);
  }

  handleConfirmSaveToLesson() {
    const targetId = this.selectTargetLesson.value;
    if (!targetId || !this.tempAiContentToSave) return;

    const targetLesson = Storage.getLesson(targetId);
    if (!targetLesson) return;

    const isAppend = this.radioSaveModeAppend ? this.radioSaveModeAppend.checked : true;

    if (isAppend) {
      Storage.appendContentToLesson(targetId, this.tempAiContentToSave);
    } else {
      Storage.updateLesson(targetId, { content: this.tempAiContentToSave });
    }

    this.closeModal(this.modalSaveToLesson);
    this.renderLessonList();

    // Nếu bài học đó đang mở trong editor thì cập nhật luôn editor
    if (this.activeLesson && this.activeLesson.id === targetId) {
      const refreshed = Storage.getLesson(targetId);
      this.editor.loadLesson(refreshed);
    }

    this.showToast(`Đã lưu nội dung vào "${targetLesson.title}"!`, 'success');
  }

  // --- THEME & TOAST UTILITIES ---
  toggleTheme() {
    const current = Storage.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    Storage.setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    this.updateThemeIcon(next);
    this.showToast(`Đã chuyển sang giao diện ${next === 'dark' ? 'Tối (Dark)' : 'Sáng (Light)'}`, 'info');
  }

  updateThemeIcon(theme) {
    if (this.btnThemeToggle) {
      this.btnThemeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      this.btnThemeToggle.title = theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối';
    }
  }

  openModal(modalEl) {
    if (modalEl) modalEl.classList.remove('hidden');
  }

  closeModal(modalEl) {
    if (modalEl) modalEl.classList.add('hidden');
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${this.escapeHtml(message)}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

  // Khởi chạy ứng dụng an toàn
  function initApp() {
    try {
      window.app = new JapaneseLearningApp();
      console.log('NihonGo AI đã khởi động thành công!');
    } catch (err) {
      console.error('Lỗi khởi động NihonGo AI:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
