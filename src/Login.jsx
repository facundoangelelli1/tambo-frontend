import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://tambo-backend-v6yp.onrender.com';

function Login({ onLoginExitoso }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                onLoginExitoso(data.token); 
                alert('¡Bienvenido! Modo Dueño activado.');
            } else {
                alert('Usuario o contraseña incorrectos.');
            }
        } catch (error) {
            console.error('Error en el login:', error);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
            <h3>🔐 Acceso Exclusivo (Dueño)</h3>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Usuario" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    style={{ marginRight: '10px' }}
                />
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    style={{ marginRight: '10px' }}
                />
                <button type="submit">Iniciar Sesión</button>
            </form>
        </div>
    );
}

export default Login;