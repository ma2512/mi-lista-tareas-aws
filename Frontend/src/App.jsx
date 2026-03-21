import { useEffect, useState } from "react";
import "./App.css"; // Importamos los estilos que definimos arriba

function App() {
 // Antes: const API_URL = "https://...";
  const API_URL = import.meta.env.VITE_API_URL;
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  // 1. OBTENER TAREAS (READ)
  const getTasks = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    getTasks();
  }, []);

  // 2. CREAR TAREA (POST)
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
  };

  // 3. ELIMINAR TAREA (DELETE)
  const deleteTask = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    getTasks();
  };

  // 4. MARCAR COMO COMPLETADA (PUT)
  const toggleTask = async (task) => {
    await fetch(`${API_URL}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, completed: !task.completed }),
    });
    getTasks();
  };

  return (
    <div className="container">
      <h1>Lista de tareas</h1>

      <form onSubmit={createTask} className="input-group">
        <input
          type="text"
          placeholder="Nueva tarea..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="btn-add">Añadir</button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <input 
              type="checkbox" 
              checked={task.completed} 
              onChange={() => toggleTask(task)} 
            />
            
            <span className={`task-text ${task.completed ? "completed" : ""}`}>
              {task.title}
            </span>

            <button className="btn-edit">Editar</button>
            <button className="btn-delete" onClick={() => deleteTask(task.id)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;