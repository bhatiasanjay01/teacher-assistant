import { from, Observable } from 'rxjs';

async function readAsString(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });
}

function readAsString$(file: File): Observable<string> {
  return from(readAsString(file));
}

export const GlobalFile = { readAsString, readAsString$ };
