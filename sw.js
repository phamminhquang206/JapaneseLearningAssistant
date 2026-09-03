/**
 * sw.js - Service Worker cho NihonGo AI Progressive Web App (PWA)
 */

const CACHE_NAME = 'nihongo-ai-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './css/layout.css',
  './css/components.css',
  './js/storage.js',
  './js/marked.min.js',
  './js/markdown.js',
  './js/gemini.js',
  './js/editor.js',
  './js/pwa.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg'
];

// Cài đặt Service Worker và lưu bộ nhớ cache các tài nguyên tĩnh
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Lỗi lưu cache tĩnh ban đầu:', err);
      });
    })
  );
  self.skipWaiting();
});

// Kích hoạt Service Worker và dọn dẹp cache phiên bản cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Xử lý các yêu cầu mạng (Fetch Strategy)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Không can thiệp vào các yêu cầu gọi Google Gemini API hoặc POST requests
  if (event.request.method !== 'GET' || requestUrl.hostname.includes('googleapis.com')) {
    return;
  }

  // 2. Với tài nguyên nội bộ: Ưu tiên mạng (Network-first), nếu mất mạng thì lấy từ Cache (Offline support)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Mất mạng hoặc offline: Tìm trong cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Nếu người dùng đang điều hướng trang HTML mà offline
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }

        return new Response('Offline: Tài nguyên chưa được lưu vào bộ nhớ đệm.', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});
