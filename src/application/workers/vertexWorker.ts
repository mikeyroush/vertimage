/**
 * Web Worker for vertex distribution calculations
 * Offloads heavy computation from the main thread
 */

import { 
  distributeVertices, 
  VertexDistributionParams,
  VertexCalculationResult 
} from '../../domain/algorithms/vertexDistribution';

// Worker message types
interface WorkerRequest {
  id: string;
  params: VertexDistributionParams & { distribution: 'hexagonal' | 'grid' | 'poisson' };
}

interface WorkerResponse {
  id: string;
  result: VertexCalculationResult;
  error?: string;
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, params } = event.data;
  
  try {
    const result = distributeVertices(params);
    
    const response: WorkerResponse = {
      id,
      result,
    };
    
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id,
      result: { vertices: [], calculationTime: 0, actualCount: 0 },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    
    self.postMessage(response);
  }
};