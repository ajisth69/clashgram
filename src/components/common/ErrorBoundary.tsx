import type { CSSProperties, ReactNode } from 'react';
import { Component } from 'react';

type OwnProps = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

const containerStyle = {
  padding: '2rem',
  margin: '2rem auto',
  maxWidth: '32rem',
  textAlign: 'center',
  fontFamily: 'inherit',
} as CSSProperties;
const headingStyle = { marginBottom: '1rem' } as CSSProperties;
const messageStyle = { marginBottom: '1.5rem', opacity: 0.8 } as CSSProperties;
const buttonStyle = {
  padding: '0.5rem 1.5rem',
  border: '1px solid currentColor',
  borderRadius: '0.5rem',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  font: 'inherit',
} as CSSProperties;

class ErrorBoundary extends Component<OwnProps, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  componentDidUpdate(prevProps: OwnProps) {
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <div role="alert" style={containerStyle}>
        <h2 style={headingStyle}>Something went wrong</h2>
        <p style={messageStyle}>
          The application encountered an unexpected error and had to recover.
        </p>
        <button
          type="button"
          onClick={() => this.setState({ hasError: false, error: undefined })}
          style={buttonStyle}
        >
          Try again
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
