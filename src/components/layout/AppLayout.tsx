/**
 * Main application layout component
 */

import { Sidebar } from './Sidebar';
import { CanvasArea } from './CanvasArea';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <CanvasArea />
    </div>
  );
}