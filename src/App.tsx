import { AppLayout } from '@/components/layout/AppLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useVertexCalculation } from '@/application/hooks/useVertexCalculation';

function App() {
  // Initialize vertex calculation hook
  useVertexCalculation();
  
  return (
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  );
}

export default App