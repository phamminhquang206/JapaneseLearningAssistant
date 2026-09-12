/**
 * firebase-config.js - Cấu hình Firebase cho dự án NihonGo AI
 * 
 * 👉 BẠN HÃY ĐIỀN THÔNG TIN FIREBASE CỦA BẠN VÀO OBJECT DƯỚI ĐÂY:
 * (Lấy từ Firebase Console > Project Settings > General > Your apps)
 */

(function () {
  'use strict';

  // 👇 ĐIỀN CẤU HÌNH FIREBASE VÀO ĐÂY:
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC-01EV9Kr6VmK1SslEaRqXm1D2YVARgBQ",
    authDomain: "learningjapanese-24f94.firebaseapp.com",
    projectId: "learningjapanese-24f94",
    storageBucket: "learningjapanese-24f94.firebasestorage.app",
    messagingSenderId: "454833128854",
    appId: "1:454833128854:web:f52ba8a474d756dcf309b7",
    measurementId: "G-YW1ZWB5TVR"
  };

  const FirebaseConfigManager = {
    /**
     * Lấy cấu hình Firebase
     * @returns {Object}
     */
    getConfig() {
      return FIREBASE_CONFIG;
    },

    /**
     * Kiểm tra xem cấu hình Firebase đã được thiết lập đầy đủ hay chưa
     * @returns {boolean}
     */
    isConfigured() {
      return !!(
        FIREBASE_CONFIG.apiKey &&
        FIREBASE_CONFIG.apiKey.trim() &&
        FIREBASE_CONFIG.projectId &&
        FIREBASE_CONFIG.projectId.trim()
      );
    }
  };

  window.FirebaseConfigManager = FirebaseConfigManager;
})();

