import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading-spin',
  templateUrl: './loading-spin.component.html',
  styleUrls: ['./loading-spin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinComponent {

}
