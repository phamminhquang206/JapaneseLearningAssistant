/**
 * pwa.js - Quản lý tính năng Progressive Web App (PWA) & Nút tải/cài đặt ứng dụng
 */

(function () {
  'use strict';

  let deferredPrompt = null;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  // Đăng ký Service Worker
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('✅ NihonGo AI Service Worker registered successfully:', reg.scope);
          })
          .catch((err) => {
            console.warn('⚠️ Lỗi đăng ký Service Worker (thường xảy ra khi chạy qua file:// thay vì http:// hoặc localhost):', err);
          });
      });
    }
  }

  // Khởi tạo nút Cài đặt PWA
  function initPwaInstall() {
    const btnInstall = document.getElementById('btn-install-pwa');
    if (!btnInstall) return;

    // Nếu ứng dụng đang chạy ở chế độ standalone (đã cài đặt rồi) thì ẩn nút
    if (isStandalone) {
      btnInstall.classList.add('hidden');
      return;
    }

    // Bắt sự kiện beforeinstallprompt trên Chrome / Edge / Android
    window.addEventListener('beforeinstallprompt', (e) => {
      // Ngăn chặn prompt mặc định của trình duyệt để gắn vào nút bấm riêng
      e.preventDefault();
      deferredPrompt = e;

      // Hiển thị nút Tải App trên thanh header
      btnInstall.classList.remove('hidden');
      btnInstall.setAttribute('data-install-ready', 'true');
    });

    // Nếu là iOS Safari (không hỗ trợ beforeinstallprompt), vẫn hiển thị nút để hướng dẫn
    if (isIos && !isStandalone) {
      btnInstall.classList.remove('hidden');
    }

    // Xử lý khi người dùng nhấp vào nút "Tải App"
    btnInstall.addEventListener('click', async () => {
      if (deferredPrompt) {
        // Kích hoạt hộp thoại cài đặt của trình duyệt
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;

        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          btnInstall.classList.add('hidden');
          showToast('🎉 Đang tiến hành cài đặt NihonGo AI về máy của bạn...', 'success');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      } else if (isIos) {
        // Hướng dẫn cài đặt trên iOS Safari
        alert('📲 Để cài đặt ứng dụng trên iPhone/iPad:\n\n1. Nhấp vào biểu tượng Chia sẻ (Share ⎋) ở thanh công cụ dưới cùng của trình duyệt Safari.\n2. Cuộn xuống và chọn "Thêm vào Màn hình chính" (Add to Home Screen).\n3. Nhấn "Thêm" (Add) ở góc trên bên phải.');
      } else {
        // Hướng dẫn nếu trình duyệt đã ẩn prompt hoặc dùng qua máy tính
        showToast('ℹ️ Hãy kiểm tra biểu tượng Cài đặt ứng dụng ⊕ trên thanh địa chỉ của trình duyệt Chrome/Edge.', 'info');
      }
    });

    // Bắt sự kiện khi app đã được cài đặt thành công
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      btnInstall.classList.add('hidden');
      showToast('🎉 Chúc mừng! NihonGo AI đã được cài đặt thành công như một ứng dụng độc lập.', 'success');
    });
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Khởi chạy
  registerServiceWorker();
  document.addEventListener('DOMContentLoaded', initPwaInstall);
})();
