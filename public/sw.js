// Minha Divulgação - Service Worker Oficial de Notificações Push
const SW_VERSION = '1.0.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Recebimento de Notificação Push Nativa
self.addEventListener('push', (event) => {
  let data = {
    title: '🔥 Minha Divulgação - Nova Oferta!',
    body: 'Confira as promoções e novidades exclusivas de hoje.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/',
    actionTitle: 'VER OFERTA'
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || 'https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png',
    badge: data.badge || 'https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png',
    image: data.image || undefined,
    data: {
      url: data.url || '/',
      notificationId: data.notificationId || null,
      timestamp: Date.now()
    },
    vibrate: [200, 100, 200],
    tag: data.tag || 'minha-divulgacao-oferta',
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: 'open_offer',
        title: data.actionTitle || '👉 VER OFERTA'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clique na Notificação Push
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';
  const notificationId = event.notification.data?.notificationId;

  // Envia evento de clique para os clientes conectados para registrar métrica
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Notifica as abas abertas sobre o clique para registrar estatísticas
      for (const client of clientList) {
        client.postMessage({
          type: 'PUSH_NOTIFICATION_CLICKED',
          notificationId,
          url: targetUrl
        });
      }

      // Se já houver uma aba aberta com o portal, foca nela e navega; se não, abre uma nova janela
      for (const client of clientList) {
        if ('focus' in client && client.url.includes(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Mensagens internas para disparar notificações em primeiro plano
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});
