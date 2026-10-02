import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Something went wrong' };
  }

  componentDidCatch(error, info) {
    console.error('Yumbite render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-yumbite-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <div className="font-display font-bold text-5xl text-yumbite-yellow mb-4">Oops!</div>
            <h1 className="font-display font-semibold text-heading-lg text-yumbite-white mb-2">Something went wrong</h1>
            <p className="text-yumbite-white/60 text-body-sm mb-6">Please refresh the page. If the problem continues, call us at 01313-886160.</p>
            <button onClick={() => window.location.reload()} className="btn-primary justify-center">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}