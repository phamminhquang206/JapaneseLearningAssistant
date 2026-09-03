/**
 * storage.js - Quản lý lưu trữ dữ liệu với LocalStorage
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
  API_KEY: 'nihongo_gemini_api_key',
  MODEL: 'nihongo_gemini_model',
  LESSONS: 'nihongo_lessons',
  ACTIVE_LESSON: 'nihongo_active_lesson_id',
  THEME: 'nihongo_theme',
  CHAT_HISTORY: 'nihongo_chat_history',
  CHAT_PANEL_WIDTH: 'nihongo_chat_panel_width',
  CHAT_COLLAPSED: 'nihongo_chat_collapsed'
};

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

// Danh sách bài học ban đầu để trống, người dùng sẽ tự tạo bài học
const INITIAL_LESSONS = [];

const AppStorage = {
  // API Key
  getApiKey() {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },
  setApiKey(key) {
    if (!key) {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    } else {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
    }
  },

  // Model
  getModel() {
    return localStorage.getItem(STORAGE_KEYS.MODEL) || '';
  },
  setModel(model) {
    if (!model) {
      localStorage.removeItem(STORAGE_KEYS.MODEL);
    } else {
      localStorage.setItem(STORAGE_KEYS.MODEL, model);
    }
  },

  // Theme
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  },
  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Lessons
  getLessons() {
    const raw = localStorage.getItem(STORAGE_KEYS.LESSONS);
    if (!raw) {
      return [];
    }
    try {
      const lessons = JSON.parse(raw);
      // Tự động dọn 2 bài học mẫu cũ (lesson-27, lesson-1) nếu còn lưu trong trình duyệt
      if (Array.isArray(lessons)) {
        const isOnlySamples = lessons.length <= 2 && lessons.every(l => l.id === 'lesson-27' || l.id === 'lesson-1');
        if (isOnlySamples && !localStorage.getItem('nihongo_samples_cleared')) {
          localStorage.setItem('nihongo_samples_cleared', 'true');
          this.saveLessons([]);
          this.setActiveLessonId(null);
          return [];
        }
        return lessons;
      }
      return [];
    } catch (e) {
      console.error('Lỗi phân tích bài học từ storage:', e);
      return [];
    }
  },
  saveLessons(lessons) {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
  },
  getLesson(id) {
    const lessons = this.getLessons();
    return lessons.find(l => l.id === id) || null;
  },
  createLesson({ title, lessonNumber, syllabus, content, tags }) {
    const lessons = this.getLessons();
    const newLesson = {
      id: 'lesson-' + Date.now(),
      lessonNumber: lessonNumber || null,
      title: title || 'Bài học mới',
      syllabus: syllabus || 'Minna no Nihongo',
      content: content || `# ${title || 'Bài học mới'}\n\n*Ghi chú nội dung bài học tại đây...*\n`,
      tags: tags || ['Tiếng Nhật'],
      status: 'learning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    lessons.unshift(newLesson);
    this.saveLessons(lessons);
    return newLesson;
  },
  updateLesson(id, updates) {
    const lessons = this.getLessons();
    const index = lessons.findIndex(l => l.id === id);
    if (index !== -1) {
      lessons[index] = {
        ...lessons[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveLessons(lessons);
      return lessons[index];
    }
    return null;
  },
  appendContentToLesson(id, contentToAppend) {
    const lesson = this.getLesson(id);
    if (!lesson) return null;
    const separator = '\n\n---\n\n';
    const updatedContent = (lesson.content || '').trim() + separator + contentToAppend.trim() + '\n';
    return this.updateLesson(id, { content: updatedContent });
  },
  deleteLesson(id) {
    let lessons = this.getLessons();
    lessons = lessons.filter(l => l.id !== id);
    this.saveLessons(lessons);
    if (this.getActiveLessonId() === id) {
      this.setActiveLessonId(null);
    }
    return lessons;
  },

  // Active Lesson
  getActiveLessonId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_LESSON) || null;
  },
  setActiveLessonId(id) {
    if (!id) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_LESSON);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LESSON, id);
    }
  },

  // Chat History
  getChatHistory() {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
  saveChatHistory(history) {
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
  },
  clearChatHistory() {
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  },

  // Layout Resizer Width
  getChatPanelWidth() {
    return localStorage.getItem(STORAGE_KEYS.CHAT_PANEL_WIDTH);
  },
  setChatPanelWidth(width) {
    if (width) {
      localStorage.setItem(STORAGE_KEYS.CHAT_PANEL_WIDTH, width);
    }
  },

  // Trạng thái thu gọn / ẩn Chat AI
  isChatCollapsed() {
    return localStorage.getItem(STORAGE_KEYS.CHAT_COLLAPSED) === 'true';
  },
  setChatCollapsed(collapsed) {
    if (collapsed) {
      localStorage.setItem(STORAGE_KEYS.CHAT_COLLAPSED, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.CHAT_COLLAPSED);
    }
  }
};

window.AppStorage = AppStorage;
})();
