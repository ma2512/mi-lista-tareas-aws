import { useState, useEffect } from "react";
import "./App.css";
import { login, register, confirmUser } from "./auth";

function App() {
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados de Tareas
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  // Estados de Autenticación
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(""); 
  const [isAuth, setIsAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // Estado para Alertas
  const [alert, setAlert] = useState({ show: false, msg: "", type: "" });

  const showAlert = (msg, type = "error") => {
    setAlert({ show: true, msg, type });
    setTimeout(() => setAlert({ show: false, msg: "", type: "" }), 4000);
  };

  const getTasks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error al obtener tareas:", error);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  // --- LÓGICA DE TAREAS ---
  const createTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, completed: false }),
    });
    setTitle("");
    getTasks();
    showAlert("Tarea añadida", "success");
  };

  const deleteTask = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    getTasks();
    showAlert("Tarea eliminada", "error");
  };

  const toggleTask = async (task) => {
    await fetch(`${API_URL}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, completed: !task.completed }),
    });
    getTasks();
  };

  const updateTask = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editText }),
    });
    setEditId(null);
    setEditText("");
    getTasks();
    showAlert("Tarea actualizada", "success");
  };

  // --- LÓGICA DE AUTENTICACIÓN ---
  const handleLogin = async () => {
    try {
      await login(email, password);
      setIsAuth(true);
      showAlert("¡Bienvenido!", "success");
    } catch (err) {
      if (err.message.includes("not confirmed") || err.name === "UserNotConfirmedException") {
        setNeedsConfirmation(true);
        showAlert("Confirma tu cuenta primero", "warning");
      } else {
        showAlert(err.message, "error");
      }
    }
  };

  const handleRegister = async () => {
    try {
      await register(email, password);
      setNeedsConfirmation(true);
      showAlert("Código enviado al correo 📩", "success");
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  const handleConfirmCode = async () => {
    try {
      await confirmUser(email, code);
      showAlert("Cuenta confirmada. Ya puedes entrar", "success");
      setNeedsConfirmation(false);
      setIsLogin(true);
      setCode("");
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  const logout = () => {
    setIsAuth(false);
    showAlert("Sesión cerrada", "success");
  };

  return (
    <div className="container">
      {/* 🔔 Toast de Alerta */}
      {alert.show && (
        <div className={`alert-toast ${alert.type}`}>
          <span>{alert.type === "success" ? "✅" : alert.type === "warning" ? "🔔" : "⚠️"}</span>
          <p>{alert.msg}</p>
        </div>
      )}

      <header className="main-header">
        <h1>TaskMaster <span>Pro</span></h1>
        {isAuth && (
          <button className="logout-btn" onClick={logout}>Cerrar sesión</button>
        )}
      </header>

      {/* 🔓 VISTA PÚBLICA */}
      {!isAuth && (
        <div className="auth-view">
          <div className="login-card">
            <h2>{needsConfirmation ? "Verificar Cuenta" : isLogin ? "¡Hola!" : "Únete"}</h2>
            <p className="subtitle">
              {needsConfirmation ? `Código enviado a ${email}` : "Gestiona tus tareas con AWS & Terraform"}
            </p>

            <div className="form-group">
              {!needsConfirmation ? (
                <>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                </>
              ) : (
                <input 
                  type="text" 
                  className="code-input" 
                  placeholder="000000" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  maxLength={6} 
                />
              )}
            </div>

            {needsConfirmation ? (
              <button className="auth-submit-btn confirm-btn" onClick={handleConfirmCode}>Confirmar Código</button>
            ) : (
              <button className="auth-submit-btn" onClick={isLogin ? handleLogin : handleRegister}>
                {isLogin ? "Iniciar Sesión" : "Registrarse"}
              </button>
            )}

            <p className="auth-toggle-text" onClick={() => { setNeedsConfirmation(false); setIsLogin(!isLogin); }}>
              {needsConfirmation ? "Volver al login" : isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Entra"}
            </p>
          </div>

          {!needsConfirmation && (
            <div className="preview-section">
              <h3>Vista rápida</h3>
              <div className="task-grid">
                {tasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="task-card-mini">
                    <span className="dot"></span> {task.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🔒 VISTA PRIVADA */}
      {isAuth && (
        <div className="dashboard-view">
          <form onSubmit={createTask} className="add-task-form">
            <input type="text" placeholder="Nueva tarea..." value={title} onChange={(e) => setTitle(e.target.value)} />
            <button type="submit">Añadir</button>
          </form>

          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className={`task-card ${task.completed ? "completed" : ""}`}>
                <div className="task-info">
                  <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} />
                  {editId === task.id ? (
                    <input className="inline-edit-input" value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus />
                  ) : (
                    <span className="task-title">{task.title}</span>
                  )}
                </div>
                <div className="task-actions">
                  {editId === task.id ? (
                    <button onClick={() => updateTask(task.id)}>💾</button>
                  ) : (
                    <button onClick={() => { setEditId(task.id); setEditText(task.title); }}>✏️</button>
                  )}
                  <button onClick={() => deleteTask(task.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;