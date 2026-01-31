import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { KafkaProvider } from './context/KafkaContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KafkaProvider>
      <App />
    </KafkaProvider>
  </StrictMode>,
)
