import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import NexusTicTacToe from './NexusTicTacToe.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // You can log errorInfo here if needed
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color: 'red', padding: 32}}>
        <h1>Something went wrong.</h1>
        <pre>{this.state.error && this.state.error.toString()}</pre>
      </div>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <NexusTicTacToe />
    </ErrorBoundary>
  </StrictMode>,
)
