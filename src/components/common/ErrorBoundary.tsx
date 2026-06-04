import type { ReactNode } from 'react';

type OwnProps = {
  children: ReactNode;
};

const ErrorBoundary = ({ children }: OwnProps) => {
  return children as any;
};

export default ErrorBoundary;
