import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import NexusTicTacToe from './NexusTicTacToe.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NexusTicTacToe />
  </StrictMode>,
)
