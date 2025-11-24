import { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="max-w-md w-full">
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              
              <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
              <p className="text-muted-foreground mb-6">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-destructive/10 rounded-2xl p-4 mb-6 text-left">
                  <p className="text-xs font-mono text-destructive break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 shadow-glow"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                <Link to="/" className="block">
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl h-12"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
