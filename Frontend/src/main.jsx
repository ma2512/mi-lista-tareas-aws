import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 🔥 POLYFILLS NECESARIOS PARA COGNITO
import { Buffer } from "buffer";

window.global = window;
window.Buffer = Buffer;
window.process = {
  env: {},
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)