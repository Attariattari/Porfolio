"use client";

import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[CRITICAL UI ERROR]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-card backdrop-blur-xl border border-border rounded-2xl shadow-2xl">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            We encountered an unexpected error. Don&apos;t worry, our team has been notified.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-card hover:bg-muted text-foreground font-semibold rounded-xl transition-all border border-border"
            >
              <Home className="w-4 h-4" />
              Back Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
