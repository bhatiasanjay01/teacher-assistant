import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class LogUpdateServiceWorkderService {
  constructor(updates: SwUpdate) {
    updates.versionUpdates.subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          console.info(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'VERSION_READY':
          console.info(`Current app version: ${evt.currentVersion.hash}`);
          console.info(`New app version ready for use: ${evt.latestVersion.hash}`);
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.info(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
          break;
      }
    });
  }

  init() {}
}
