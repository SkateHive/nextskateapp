declare module 'piexifjs' {
    interface ExifData {
      GPSLatitude?: number[];
      GPSLatitudeRef?: string;
      GPSLongitude?: number[];
      GPSLongitudeRef?: string;
      [key: string]: any; 
    }
  
    function load(data: string): ExifData;
    function insert(data: string, exifData: ExifData): string;
  }
  