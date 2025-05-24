
  // frontend/src/lib/utils.ts

  // File size formatter
  export function formatBytes(bytes: number, decimals = 2): string {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Simple input sanitizer (basic example, consider a library for more complex needs)
  export function sanitizeInput(text: string): string {
      const element = document.createElement('div');
      element.innerText = text;
      return element.innerHTML; // Basic HTML entity encoding
  }
