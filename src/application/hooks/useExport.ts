/**
 * Custom hook for CSV export functionality
 */

import { useCallback } from 'react';
import { useDroneStore } from '../store/droneStore';
import { useImageStore } from '../store/imageStore';
import { useConfigStore } from '../store/configStore';
import { DroneExportRow, ExportData } from '@/domain/types';
import { APP_VERSION } from '@/domain/constants/defaults';
import { generateCSV, downloadCSV, generateFilename, validateExportData } from '@/infrastructure/export/csvGenerator';

export function useExport() {
  const drones = useDroneStore((state) => state.drones);
  const getActiveDrones = useDroneStore((state) => state.getActiveDrones);
  const getStatistics = useDroneStore((state) => state.getStatistics);
  const currentImage = useImageStore((state) => state.currentImage);
  const config = useConfigStore();
  
  const generateExportData = useCallback((): ExportData | null => {
    if (!currentImage || drones.length === 0) return null;
    
    const activeDrones = getActiveDrones();
    const stats = getStatistics();
    
    if (!stats) return null;
    
    // Generate export rows
    const rows: DroneExportRow[] = activeDrones.map((drone, index) => ({
      droneId: index + 1,
      x: Math.round(drone.position.x),
      y: Math.round(drone.position.y),
      red: drone.color.r,
      green: drone.color.g,
      blue: drone.color.b,
      brightness: Math.round(drone.brightness * 100),
    }));
    
    // Generate metadata
    const metadata = {
      totalDrones: stats.total,
      activeDrones: stats.active,
      filteredDrones: stats.filtered,
      imageWidth: currentImage.width,
      imageHeight: currentImage.height,
      brightnessThreshold: config.brightnessThreshold,
      samplingRadius: config.samplingRadius,
      exportDate: new Date().toISOString(),
      version: APP_VERSION,
    };
    
    return {
      drones: rows,
      metadata,
    };
  }, [drones, getActiveDrones, getStatistics, currentImage, config]);
  
  const exportToCSV = useCallback(() => {
    const exportData = generateExportData();
    if (!exportData) {
      console.error('No export data available');
      return;
    }
    
    // Validate export data
    const validation = validateExportData(exportData);
    if (!validation.valid) {
      console.error('Invalid export data:', validation.errors);
      return;
    }
    
    try {
      // Generate CSV content
      const csvContent = generateCSV(exportData, {
        includeHeader: true,
        includeMetadata: true,
      });
      
      // Generate filename with timestamp
      const filename = generateFilename('vertimage-drones');
      
      // Download the file
      downloadCSV(csvContent, filename);
      
      console.log(`Exported ${exportData.drones.length} drones to ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [generateExportData]);
  
  const canExport = drones.length > 0 && currentImage !== null;
  
  return {
    exportToCSV,
    canExport,
    generateExportData,
  };
}