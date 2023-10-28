import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { LambdaService } from '../../../shared/core/lambda.service';

@Component({
  selector: 'app-global-loading-bar',
  templateUrl: './global-loading-bar.component.html',
  styleUrls: ['./global-loading-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalLoadingBarComponent {
  isLoading$: Observable<boolean>;

  constructor(private lambdaService: LambdaService) {
    this.isLoading$ = this.lambdaService.isLoading$;
  }
}
