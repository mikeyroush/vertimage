/**
 * Button to export drone data as CSV
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, AlertCircle } from 'lucide-react';
import { useExport } from '@/application/hooks/useExport';
import { useDroneStore } from '@/application/store/droneStore';

export function ExportButton() {
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const { exportToCSV, canExport } = useExport();
  const isCalculating = useDroneStore((state) => state.isCalculating);
  const activeDrones = useDroneStore((state) => state.getActiveDrones());
  
  const handleExport = async () => {
    if (!canExport) return;
    
    setExportStatus('exporting');
    
    try {
      exportToCSV();
      setExportStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      setExportStatus('error');
      console.error('Export failed:', error);
      
      // Reset status after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };
  
  const getButtonContent = () => {
    switch (exportStatus) {
      case 'exporting':
        return (
          <>
            <Download className="mr-2 h-4 w-4 animate-pulse" />
            Exporting...
          </>
        );
      case 'success':
        return (
          <>
            <Check className="mr-2 h-4 w-4" />
            Export Complete!
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Export Failed
          </>
        );
      default:
        return (
          <>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
            {activeDrones.length > 0 && (
              <span className="ml-2 text-xs opacity-70">
                ({activeDrones.length} drones)
              </span>
            )}
          </>
        );
    }
  };
  
  const getButtonVariant = () => {
    switch (exportStatus) {
      case 'success':
        return 'default' as const; // Keep default styling for success
      case 'error':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };
  
  return (
    <Button 
      onClick={handleExport}
      disabled={!canExport || isCalculating || exportStatus === 'exporting'}
      className="w-full"
      size="lg"
      variant={getButtonVariant()}
    >
      {getButtonContent()}
    </Button>
  );
}