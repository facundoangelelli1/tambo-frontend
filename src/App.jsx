import { useState, useEffect } from 'react'
import BotonNotificaciones from './BotonNotificaciones';
import Login from './Login';

function App() {
  const [vacasEnAlerta, setVacasEnAlerta] = useState([])
  const [cargando, setCargando] = useState(true)

  // --- ESTADOS PARA EL DUEÑO ---
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [todasLasVacas, setTodasLasVacas] = useState([])
  
  // Estados para el formulario de crear vaca
  const [nuevaCaravana, setNuevaCaravana] = useState('')
  const [tieneCelo, setTieneCelo] = useState(false) // Checkbox para saber si ponemos fecha
  const [fechaCelo, setFechaCelo] = useState('') // La fecha elegida

  useEffect(() => {
    obtenerAlertas()
  }, [])

  useEffect(() => {
    if (token) {
      cargarTodasLasVacas()
    }
  }, [token])

  const obtenerAlertas = async () => {
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/alertas-celo/')
      const datos = await respuesta.json()
      setVacasEnAlerta(datos)
      setCargando(false)
    } catch (error) {
      console.error("Error al cargar los datos:", error)
      setCargando(false)
    }
  }

  const registrarCelo = async (vacaId, caravana) => {
    if (!window.confirm(`¿Seguro que quieres registrar el celo de la vaca ${caravana} hoy?`)) return
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/registrar-celo/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vaca_id: vacaId })
      })

      if (respuesta.ok) {
        setVacasEnAlerta(vacasEnAlerta.filter(vaca => vaca.id !== vacaId))
        alert(`✅ Celo de la vaca ${caravana} registrado con éxito.`)
      }
    } catch (error) {
      alert("Error de conexión al registrar.")
    }
  }

  const cargarTodasLasVacas = async () => {
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/vacas/', {
        headers: { 'Authorization': `Token ${token}` }
      })
      if (respuesta.ok) {
        const datos = await respuesta.json()
        setTodasLasVacas(datos)
      }
    } catch (error) {
      console.error("Error al cargar todas las vacas", error)
    }
  }

  const crearVaca = async (e) => {
    e.preventDefault()
    if (!nuevaCaravana) return

    // Preparamos los datos según si eligió poner fecha o no
    const datosVaca = {
      caravana: nuevaCaravana,
      activa: true,
      fecha_ultimo_celo: tieneCelo ? fechaCelo : null
    }

    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/vacas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(datosVaca)
      })

      if (respuesta.ok) {
        alert(`🐄 Vaca ${nuevaCaravana} agregada exitosamente al sistema.`)
        // Limpiamos el formulario
        setNuevaCaravana('')
        setTieneCelo(false)
        setFechaCelo('')
        cargarTodasLasVacas() 
      } else {
        // Si hay error, leemos qué nos dice Django
        const errorData = await respuesta.json()
        console.error("Motivo del error de Django:", errorData)
        alert("Error al crear la vaca. Puede que la caravana ya exista. Revisa la consola (F12) para más detalles.")
      }
    } catch (error) {
      console.error("Error al crear:", error)
    }
  }

  const borrarVaca = async (vacaId, caravana) => {
    if (!window.confirm(`⚠️ ¿ESTÁS SEGURO? Vas a eliminar la vaca ${caravana} definitivamente del sistema.`)) return
    try {
      const respuesta = await fetch(`http://127.0.0.1:8000/api/vacas/${vacaId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      })

      if (respuesta.ok) {
        setTodasLasVacas(todasLasVacas.filter(vaca => vaca.id !== vacaId))
        setVacasEnAlerta(vacasEnAlerta.filter(vaca => vaca.id !== vacaId))
      } else {
        alert("Error al intentar borrar.")
      }
    } catch (error) {
      console.error("Error al borrar:", error)
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    setToken(null)
    setTodasLasVacas([])
  }

  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.titulo}>🐮 Tambo Control</h1>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <BotonNotificaciones />
      </div>

      <h2 style={estilos.subtitulo}>🔥 Alertas de Celo (Día 19-21)</h2>

      {cargando ? (
        <p style={{textAlign: 'center'}}>Cargando datos...</p>
      ) : vacasEnAlerta.length === 0 ? (
        <div style={estilos.tarjetaVacia}>
          <p>¡Todo al día! No hay vacas en ventana de celo hoy.</p>
        </div>
      ) : (
        vacasEnAlerta.map((vaca) => (
          <div key={vaca.id} style={estilos.tarjeta}>
            <div style={estilos.infoVaca}>
              <h1 style={estilos.caravana}>{vaca.caravana}</h1>
              <p style={estilos.textoInfo}>
                Último celo: <strong>{vaca.ultimo_celo}</strong> <br/>
                Hace: <strong style={{color: '#d9534f'}}>{vaca.dias_transcurridos} días</strong>
              </p>
            </div>
            <button style={estilos.boton} onClick={() => registrarCelo(vaca.id, vaca.caravana)}>
              CONFIRMAR CELO HOY ✔️
            </button>
          </div>
        ))
      )}

      {/* --- SECCIÓN PRIVADA (DUEÑO) --- */}
      <div style={{ marginTop: '40px', borderTop: '2px dashed #ccc', paddingTop: '20px' }}>
        <h2 style={{...estilos.titulo, color: '#555', fontSize: '22px'}}>⚙️ Área Administrativa</h2>
        
        {!token ? (
          <Login onLoginExitoso={(nuevoToken) => setToken(nuevoToken)} />
        ) : (
          <div style={estilos.panelDueno}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#2b542c' }}>✅ Modo Dueño Activo</p>
              <button onClick={cerrarSesion} style={estilos.botonSalir}>Cerrar Sesión</button>
            </div>

            {/* FORMULARIO MEJORADO PARA AGREGAR VACA */}
            <form onSubmit={crearVaca} style={estilos.formularioVaca}>
              <input 
                type="text" 
                placeholder="Número de Caravana" 
                value={nuevaCaravana}
                onChange={(e) => setNuevaCaravana(e.target.value)}
                style={estilos.inputTexto}
                required
              />
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={tieneCelo}
                  onChange={(e) => setTieneCelo(e.target.checked)}
                />
                ¿Registrar fecha de último celo?
              </label>

              {tieneCelo && (
                <input 
                  type="date" 
                  value={fechaCelo}
                  onChange={(e) => setFechaCelo(e.target.value)}
                  style={estilos.inputTexto}
                  required
                />
              )}

              <button type="submit" style={estilos.botonAgregar}>+ AGREGAR VACA</button>
            </form>

            <h3 style={{ marginTop: '25px', fontSize: '18px' }}>Todas las vacas registradas:</h3>
            <ul style={estilos.listaVacas}>
              {todasLasVacas.map(vaca => (
                <li key={vaca.id} style={estilos.itemVaca}>
                  <span>🐄 Caravana: <strong>{vaca.caravana}</strong></span>
                  <button onClick={() => borrarVaca(vaca.id, vaca.caravana)} style={estilos.botonBorrar}>
                    🗑️ Borrar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// Estilos
const estilos = {
  contenedor: { padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
  titulo: { textAlign: 'center', color: '#333' },
  subtitulo: { backgroundColor: '#f0ad4e', color: 'white', padding: '10px', borderRadius: '8px', textAlign: 'center' },
  tarjeta: { border: '2px solid #ddd', borderRadius: '12px', padding: '15px', marginBottom: '15px', backgroundColor: '#fafafa', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
  tarjetaVacia: { textAlign: 'center', padding: '40px', backgroundColor: '#e2f0d9', borderRadius: '12px', color: '#3c763d', fontSize: '18px' },
  infoVaca: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  caravana: { fontSize: '48px', margin: '0', color: '#333' },
  textoInfo: { fontSize: '16px', color: '#555', textAlign: 'right' },
  boton: { backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '8px', padding: '20px', fontSize: '20px', fontWeight: 'bold', width: '100%', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' },
  
  // Estilos del dueño
  panelDueno: { backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '12px', marginTop: '15px', border: '1px solid #c8e6c9' },
  botonSalir: { backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' },
  formularioVaca: { display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ccc' },
  inputTexto: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' },
  botonAgregar: { backgroundColor: '#337ab7', color: 'white', border: 'none', borderRadius: '5px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  listaVacas: { listStyleType: 'none', padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto' },
  itemVaca: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '10px', borderBottom: '1px solid #eee', borderRadius: '5px', marginBottom: '5px' },
  botonBorrar: { backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }
}

export default App