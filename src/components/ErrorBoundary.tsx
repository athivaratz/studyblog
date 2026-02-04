"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] dark:bg-[#1A1A1A] p-4">
          <div
            className="max-w-md w-full rounded-2xl border-2 p-6 text-center"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#00568C",
              boxShadow: "4px 4px 0px #00568C",
            }}
          >
            {/* Icon */}
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#FFE4C9" }}
            >
              <AlertTriangle className="w-8 h-8 text-[#FF6B6B]" />
            </div>

            {/* Title */}
            <h2 className="font-felipa text-2xl text-[#1A1A1A] mb-2">
              อุ๊ปส์! มีบางอย่างผิดพลาด
            </h2>

            {/* Description */}
            <p className="font-kanit text-sm text-gray-600 mb-6">
              เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 p-3 rounded-lg bg-gray-100 text-left overflow-auto max-h-32">
                <code className="text-xs text-red-600 font-mono">
                  {this.state.error.message}
                </code>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-kanit text-sm transition-all hover:scale-105"
                style={{
                  borderColor: "#00568C",
                  backgroundColor: "#C5E8FF",
                  color: "#00568C",
                }}
              >
                <RefreshCcw className="w-4 h-4" />
                ลองใหม่
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-kanit text-sm transition-all hover:scale-105"
                style={{
                  borderColor: "#00568C",
                  backgroundColor: "#00568C",
                  color: "#FFFFFF",
                }}
              >
                <Home className="w-4 h-4" />
                หน้าแรก
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary wrapper for functional components
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
