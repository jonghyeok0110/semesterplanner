// 오프라인에서도 앱 화면이 열리도록 기본 파일을 저장해 둡니다.
// index.html을 고친 뒤에는 아래 버전 숫자를 올려 주세요.
const CACHE = 'semester-planner-v7';
const SHELL = ['./', './index.html', './manifest.webmanifest', './favicon.svg', './favicon.ico', './favicon-32.png',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // 구글 로그인·드라이브·폰트 요청은 손대지 않음
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // 페이지: 네트워크 먼저(최신 버전), 실패하면 저장본
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
