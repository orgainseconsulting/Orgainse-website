// Service Worker for Orgainse Consulting Website
// Advanced caching and performance optimization

const CACHE_NAME = 'orgainse-consulting-v1.2';
const STATIC_CACHE = 'orgainse-static-v1.2';
const DYNAMIC_CACHE = 'orgainse-dynamic-v1.2';
const API_CACHE = 'orgainse-api-v1.2';

// Critical resources to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/logo-orgainse-consulting.png',
  '/hero-image-ai-consulting.jpg'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/health',
  '/api/newsletter',
  '/api/contact'
];

// Resources to cache with network-first strategy
const NETWORK_FIRST_PATHS = [
  '/api/',
  '/admin'
];

// Resources to cache with cache-first strategy
const CACHE_FIRST_PATHS = [
  '/static/',
  '/images/',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.css',
  '.js'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // API requests - Network first with fallback
  if (isApiRequest(url.pathname)) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }
  
  // Static assets - Cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }
  
  // Dynamic content - Stale while revalidate
  event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE));
});

// Network first strategy (for APIs)
async function networkFirstStrategy(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

// Cache first strategy (for static assets)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached version immediately
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Stale while revalidate strategy (for dynamic content)
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Start fetching updated version in background
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.log('[SW] Background fetch failed:', request.url);
    return null;
  });
  
  // Return cached version immediately, or wait for network
  return cachedResponse || networkResponsePromise;
}

// Helper functions
function isApiRequest(pathname) {
  return pathname.startsWith('/api/') || 
         API_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint));
}

function isStaticAsset(pathname) {
  return CACHE_FIRST_PATHS.some(path => 
    pathname.includes(path) || pathname.endsWith(path)
  );
}

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form') {
    event.waitUntil(syncContactForm());
  }
  
  if (event.tag === 'newsletter-signup') {
    event.waitUntil(syncNewsletterSignup());
  }
});

async function syncContactForm() {
  try {
    const requests = await getStoredRequests('contact-forms');
    
    for (const requestData of requests) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData.data)
        });
        
        if (response.ok) {
          await removeStoredRequest('contact-forms', requestData.id);
          console.log('[SW] Contact form synced successfully');
        }
      } catch (error) {
        console.log('[SW] Failed to sync contact form:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Background sync failed:', error);
  }
}

async function syncNewsletterSignup() {
  try {
    const requests = await getStoredRequests('newsletter-signups');
    
    for (const requestData of requests) {
      try {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData.data)
        });
        
        if (response.ok) {
          await removeStoredRequest('newsletter-signups', requestData.id);
          console.log('[SW] Newsletter signup synced successfully');
        }
      } catch (error) {
        console.log('[SW] Failed to sync newsletter signup:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Newsletter sync failed:', error);
  }
}

// IndexedDB helpers for background sync
async function getStoredRequests(store) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('orgainse-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const getAllRequest = objectStore.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('contact-forms')) {
        db.createObjectStore('contact-forms', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('newsletter-signups')) {
        db.createObjectStore('newsletter-signups', { keyPath: 'id' });
      }
    };
  });
}

async function removeStoredRequest(store, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('orgainse-offline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const deleteRequest = objectStore.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Push notification handling
self.addEventListener('push', event => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/logo-orgainse-consulting.png',
      badge: '/logo-orgainse-consulting.png',
      tag: 'orgainse-notification',
      renotify: true,
      actions: [
        {
          action: 'open',
          title: 'Open Website'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('Orgainse Consulting', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('https://www.orgainse.com')
    );
  }
});

// Periodic background sync for analytics
self.addEventListener('periodicsync', event => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  try {
    // Sync any pending analytics data
    console.log('[SW] Syncing analytics data...');
    
    // Implementation would depend on analytics system
    // This is a placeholder for periodic analytics sync
  } catch (error) {
    console.log('[SW] Analytics sync failed:', error);
  }
}

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service worker loaded successfully');