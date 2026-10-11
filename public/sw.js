// frontend_tambo/public/sw.js

self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    
    const titulo = data.titulo || '🐄 Alerta de Celos - Tambo';
    const opciones = {
        body: data.mensaje || 'Hay vacas en ventana de celo para revisar hoy.',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});