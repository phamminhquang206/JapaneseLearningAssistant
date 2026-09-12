/**
 * firebase-service.js - Quản lý tương tác Firebase Auth và Cloud Firestore
 * Hỗ trợ đồng bộ dữ liệu bài học và lịch sử chat theo từng tài khoản Google (uid).
 */

(function () {
  'use strict';

  const FirebaseService = {
    app: null,
    auth: null,
    db: null,
    isInitialized: false,
    currentUser: null,
    authListeners: [],
    lessonUnsubscribe: null,

    /**
     * Khởi tạo Firebase nếu có cấu hình hợp lệ
     * @returns {boolean} True nếu khởi tạo thành công
     */
    init() {
      if (typeof window.firebase === 'undefined') {
        console.warn('Firebase SDK chưa được nạp.');
        return false;
      }

      if (!window.FirebaseConfigManager || !window.FirebaseConfigManager.isConfigured()) {
        return false;
      }

      const config = window.FirebaseConfigManager.getConfig();

      try {
        if (!firebase.apps.length) {
          this.app = firebase.initializeApp(config);
        } else {
          this.app = firebase.app();
        }

        this.auth = firebase.auth();
        this.db = firebase.firestore();

        // Kích hoạt lưu cache ngoại tuyến (Offline Persistence)
        this.db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Firestore offline persistence: Đang mở nhiều tab cùng lúc.');
          } else if (err.code === 'unimplemented') {
            console.warn('Firestore offline persistence: Trình duyệt không hỗ trợ IndexedDB.');
          }
        });

        this.isInitialized = true;

        // Lắng nghe trạng thái đăng nhập
        this.auth.onAuthStateChanged((user) => {
          this.currentUser = user;
          this.authListeners.forEach((callback) => {
            try {
              callback(user);
            } catch (e) {
              console.error('Lỗi trong Auth State Listener:', e);
            }
          });
        });

        return true;
      } catch (err) {
        console.error('Lỗi khởi tạo Firebase:', err);
        this.isInitialized = false;
        return false;
      }
    },

    /**
     * Đăng ký lắng nghe sự kiện đổi trạng thái người dùng (Login / Logout)
     * @param {Function} callback 
     */
    onAuthStateChanged(callback) {
      if (typeof callback === 'function') {
        this.authListeners.push(callback);
        if (this.isInitialized && this.auth) {
          callback(this.currentUser);
        }
      }
    },

    /**
     * Đăng nhập với tài khoản Google (Popup)
     * @returns {Promise<{success: boolean, user?: Object, error?: string, needConfig?: boolean}>}
     */
    async loginWithGoogle() {
      if (!this.isInitialized) {
        const initialized = this.init();
        if (!initialized) {
          return {
            success: false,
            needConfig: true,
            error: 'Chưa cấu hình Firebase Project. Vui lòng kiểm tra file js/firebase-config.js.'
          };
        }
      }

      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await this.auth.signInWithPopup(provider);
        const user = result.user;

        // Lưu thông tin người dùng cơ bản lên Firestore
        if (user && this.db) {
          try {
            await this.db.collection('users').doc(user.uid).set({
              displayName: user.displayName || '',
              email: user.email || '',
              photoURL: user.photoURL || '',
              lastLoginAt: new Date().toISOString()
            }, { merge: true });
          } catch (e) {
            console.warn('Lỗi ghi thông tin user profile:', e);
          }
        }

        return { success: true, user };
      } catch (error) {
        console.error('Lỗi khi đăng nhập Google:', error);
        let errorMsg = error.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.';
        const currentHost = window.location.hostname || 'localhost';

        if (error.code === 'auth/unauthorized-domain') {
          errorMsg = `Tên miền "${currentHost}" chưa được ủy quyền trên Firebase. Vui lòng thêm "${currentHost}" vào mục "Authorized domains" trên Firebase Console (Authentication > Settings > Authorized domains).`;
          if (currentHost === '127.0.0.1') {
            errorMsg += ' Mẹo: Bạn có thể đổi địa chỉ thanh địa chỉ thành http://localhost:8085 để đăng nhập.';
          }
        } else if (error.code === 'auth/popup-closed-by-user') {
          errorMsg = 'Cửa sổ đăng nhập Google đã bị đóng trước khi hoàn tất.';
        } else if (error.code === 'auth/cancelled-popup-request') {
          errorMsg = 'Yêu cầu đăng nhập đã bị hủy.';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMsg = 'Phương thức đăng nhập bằng Google chưa được Bật (Enable) trên Firebase Console > Authentication > Sign-in method.';
        }

        return {
          success: false,
          error: errorMsg,
          code: error.code
        };
      }
    },

    /**
     * Đăng xuất tài khoản hiện tại
     * @returns {Promise<boolean>}
     */
    async logout() {
      if (!this.auth) return true;
      try {
        await this.auth.signOut();
        this.currentUser = null;
        return true;
      } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
        return false;
      }
    },

    /**
     * Lấy thông tin người dùng hiện tại
     * @returns {Object|null}
     */
    getCurrentUser() {
      return this.currentUser || (this.auth ? this.auth.currentUser : null);
    },

    // =========================================================================
    // CLOUD FIRESTORE DATA SYNC (BÀI HỌC & GHI CHÚ)
    // =========================================================================

    /**
     * Lấy danh sách toàn bộ bài học của user từ Cloud Firestore
     * @param {string} uid
     * @returns {Promise<Array>}
     */
    async fetchLessonsFromCloud(uid) {
      if (!this.db || !uid) return [];
      try {
        const snapshot = await this.db.collection('users').doc(uid).collection('lessons').get();
        const lessons = [];
        snapshot.forEach((doc) => {
          lessons.push(doc.data());
        });
        // Sắp xếp theo ngày cập nhật mới nhất
        lessons.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
        return lessons;
      } catch (error) {
        console.error('Lỗi tải bài học từ Cloud:', error);
        return [];
      }
    },

    /**
     * Đồng bộ dữ liệu bài học từ Cloud Firestore xuống Local.
     * Cloud Firestore là Nguồn Chân Lý duy nhất (Single Source of Truth).
     * Bất kỳ bài học nào đã xóa ở thiết bị bất kỳ thì trên database sẽ xóa luôn,
     * các thiết bị khác khi đồng bộ/tải lại sẽ loại bỏ bài học đó, tuyệt đối không tải ngược lên lại.
     * @param {string} uid
     * @param {Array} localLessons
     * @returns {Promise<Array>} Danh sách bài học chuẩn từ Cloud Firestore
     */
    async syncLessons(uid, localLessons = []) {
      if (!this.db || !uid) return localLessons;

      try {
        const cloudLessons = await this.fetchLessonsFromCloud(uid);
        const migrationKey = `nihongo_cloud_init_${uid}`;
        const hasMigrated = localStorage.getItem(migrationKey);

        // Trường hợp duy nhất tải từ local lên Cloud:
        // Lần đầu tiên tài khoản này đăng nhập vào hệ thống, Cloud chưa có bài học nào (0 bài),
        // và máy local này có dữ liệu cũ cần đưa lên đám mây.
        if (!hasMigrated && cloudLessons.length === 0 && localLessons && localLessons.length > 0) {
          const batch = this.db.batch();
          localLessons.forEach((ll) => {
            const docRef = this.db.collection('users').doc(uid).collection('lessons').doc(ll.id);
            batch.set(docRef, ll);
          });
          await batch.commit();
          localStorage.setItem(migrationKey, 'true');
          return localLessons;
        }

        // Đánh dấu đã khởi tạo
        localStorage.setItem(migrationKey, 'true');

        // CLOUD LÀ DUY NHẤT:
        // Trả về chính xác những bài học đang tồn tại trên Cloud Firestore.
        // Bất kỳ bài nào bị xóa trên Cloud sẽ bị loại bỏ khỏi LocalStorage.
        return cloudLessons;
      } catch (error) {
        console.error('Lỗi khi đồng bộ bài học với Firestore:', error);
        return localLessons;
      }
    },

    /**
     * Lắng nghe bài học thay đổi theo thời gian thực (Real-time Firestore Listener)
     * Khi có bất kỳ thiết bị nào thêm, sửa, hoặc xóa bài học, sự kiện này sẽ kích hoạt ngay lập tức.
     * @param {string} uid
     * @param {Function} callback
     */
    listenToLessons(uid, callback) {
      if (!this.db || !uid) return;

      // Dừng listener cũ nếu có
      this.stopListeningToLessons();

      try {
        this.lessonUnsubscribe = this.db
          .collection('users')
          .doc(uid)
          .collection('lessons')
          .onSnapshot(
            (snapshot) => {
              const lessons = [];
              snapshot.forEach((doc) => {
                lessons.push(doc.data());
              });
              lessons.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
              if (typeof callback === 'function') {
                callback(lessons);
              }
            },
            (error) => {
              console.warn('Lỗi Firestore onSnapshot bài học:', error);
            }
          );
      } catch (err) {
        console.warn('Không thể khởi tạo onSnapshot:', err);
      }
    },

    /**
     * Dừng lắng nghe thời gian thực bài học
     */
    stopListeningToLessons() {
      if (this.lessonUnsubscribe) {
        try {
          this.lessonUnsubscribe();
        } catch (e) {}
        this.lessonUnsubscribe = null;
      }
    },

    /**
     * Lưu hoặc cập nhật 1 bài học lên Firestore
     * @param {string} uid
     * @param {Object} lesson
     * @returns {Promise<boolean>}
     */
    async saveLessonToCloud(uid, lesson) {
      if (!this.db || !uid || !lesson || !lesson.id) return false;
      try {
        await this.db
          .collection('users')
          .doc(uid)
          .collection('lessons')
          .doc(lesson.id)
          .set(lesson, { merge: true });
        return true;
      } catch (error) {
        console.error('Lỗi lưu bài học lên Cloud:', error);
        return false;
      }
    },

    /**
     * Xóa 1 bài học khỏi Firestore
     * @param {string} uid
     * @param {string} lessonId
     * @returns {Promise<boolean>}
     */
    async deleteLessonFromCloud(uid, lessonId) {
      if (!this.db || !uid || !lessonId) return false;
      try {
        await this.db
          .collection('users')
          .doc(uid)
          .collection('lessons')
          .doc(lessonId)
          .delete();
        console.log(`Đã xóa bài học ${lessonId} trên Cloud Firestore.`);
        return true;
      } catch (error) {
        console.error('Lỗi xóa bài học trên Cloud:', error);
        throw error;
      }
    },

    /**
     * Lưu lịch sử chat AI lên Firestore
     * @param {string} uid
     * @param {Array} history
     */
    async saveChatHistoryToCloud(uid, history) {
      if (!this.db || !uid) return;
      try {
        await this.db
          .collection('users')
          .doc(uid)
          .collection('meta')
          .doc('chat')
          .set({
            history: history || [],
            updatedAt: new Date().toISOString()
          }, { merge: true });
      } catch (error) {
        console.error('Lỗi lưu lịch sử chat lên Cloud:', error);
      }
    },

    /**
     * Lấy lịch sử chat AI từ Firestore
     * @param {string} uid
     * @returns {Promise<Array|null>}
     */
    async fetchChatHistoryFromCloud(uid) {
      if (!this.db || !uid) return null;
      try {
        const doc = await this.db.collection('users').doc(uid).collection('meta').doc('chat').get();
        if (doc.exists) {
          const data = doc.data();
          return data.history || [];
        }
        return null;
      } catch (error) {
        console.error('Lỗi tải lịch sử chat từ Cloud:', error);
        return null;
      }
    }
  };

  window.FirebaseService = FirebaseService;
})();
