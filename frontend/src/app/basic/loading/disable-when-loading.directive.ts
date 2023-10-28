import { Directive, ElementRef } from '@angular/core';
import { LambdaService } from '../../shared/core/lambda.service';

@Directive({
  selector: '[appDisableWhenLoading]',
})
export class DisableWhenLoadingDirective {
  constructor(private el: ElementRef, private lambdaService: LambdaService) {
    el.nativeElement.disabled = true;
  }
}
