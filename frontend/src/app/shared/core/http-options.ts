import { HttpHeaders } from '@angular/common/http';

export class HttpOptions {
  static getOptions() {
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
  }
}
