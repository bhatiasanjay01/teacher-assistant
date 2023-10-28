import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-version-upgrade-header',
  templateUrl: './version-upgrade-header.component.html',
  styleUrls: ['./version-upgrade-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionUpgradeHeaderComponent {
  isShow = false;

  subscription: Subscription;

  constructor(private updates: SwUpdate, private ref: ChangeDetectorRef) {
    this.subscription = this.updates.versionUpdates.subscribe((evt) => {
      if (evt.type === 'VERSION_READY') {
        this.isShow = true;
        this.ref.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onUpgradeClick() {
    window.location.reload();
  }
}
