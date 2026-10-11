// frontend_tambo/src/BotonNotificaciones.jsx

import React from 'react';

// Reemplaza con tu Public Key de VAPID generada anteriormente
const VAPID_PUBLIC_KEY = 'BOThkGmpMS-Lmlso4k0LvELzC47A8JeLLZoeuaG9W3iXk0WEVjCEcRr1vdxWjOW_vyJxVrm8pk6tNt7H7USzeHY';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const BotonNotificaciones = () => {
    
    const activarNotificaciones = async () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const permiso = await Notification.requestPermission();
                if (permiso !== 'granted') {
                    alert('Permiso denegado para mostrar notificaciones.');
                    return;
                }

                const register = await navigator.serviceWorker.register('/sw.js');
                
                // --- CANCELAR CUALQUIER SUSCRIPCIÓN VIEJA ---
                const suscripcionVieja = await register.pushManager.getSubscription();
                if (suscripcionVieja) {
                    await suscripcionVieja.unsubscribe();
                }

                // --- CREAR NUEVA SUSCRIPCIÓN CON LA CLAVE ACTUAL ---
                const subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });

                const res = await fetch('http://localhost:8000/api/suscripcion-push/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(subscription)
                });

                if (res.ok) {
                    alert('¡Suscripción limpia generada exitosamente!');
                } else {
                    alert('Error al guardar la suscripción en el servidor.');
                }

            } catch (error) {
                console.error('Error al activar notificaciones:', error);
                alert('Hubo un problema al activar las notificaciones.');
            }
        }
    };
        

    return (
        <button 
            onClick={activarNotificaciones}
            style={{ 
                padding: '10px 18px', 
                backgroundColor: '#2e7d32', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '10px'
            }}
        >
            🔔 Activar Alertas en este dispositivo
        </button>
    );
};

export default BotonNotificaciones;