import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './responsive.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0f4ff", color: "#1e293b", fontFamily: "'Noto Sans KR', sans-serif" }}>
          <div style={{ textAlign: "center", maxWidth: 400, padding: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ margin: "0 0 12px", fontSize: 20 }}>앱에 오류가 발생했습니다</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>{this.state.error?.message}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); }}
              style={{ padding: "12px 24px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginRight: 8 }}
            >
              다시 시도
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "12px 24px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, color: "#64748b", fontSize: 14, cursor: "pointer" }}
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
