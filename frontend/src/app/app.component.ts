import { Component, signal } from '@angular/core';
import { VERSION } from '../version';
import { CheckForUpdateService } from './core/service-worker/check-for-update.service-worker.service';
import { LogUpdateServiceWorkderService } from './core/service-worker/log-update.service-worker.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private logUpdateServiceWorkderService: LogUpdateServiceWorkderService,
    private checkForUpdateService: CheckForUpdateService
  ) {
    console.info('version: ' + VERSION);

    this.logUpdateServiceWorkderService.init();
    this.checkForUpdateService.init();

    window.addEventListener('online', this.updateOnline.bind(this));
    window.addEventListener('offline', this.updateOnline.bind(this));
  }

  isOnline = signal<boolean>(true);

  updateOnline() {
    this.isOnline.set(navigator.onLine);
  }

  version() {
    return VERSION;
  }
}
