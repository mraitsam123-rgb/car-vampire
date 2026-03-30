import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center space-y-6 shadow-xl">
            <div className="text-6xl animate-bounce">⚠️</div>
            <h1 className="text-3xl font-black text-indigo-900 uppercase italic">Something went wrong</h1>
            <p className="text-gray-500 font-bold uppercase tracking-tight">The application encountered an unexpected error. Don't worry, your data is safe.</p>
            <button 
              onClick={() => window.location.href = "/"}
              className="w-full py-4 bg-indigo-900 text-white font-black rounded-full hover:bg-indigo-800 transition shadow-lg uppercase tracking-widest text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
