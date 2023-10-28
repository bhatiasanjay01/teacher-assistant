import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-ai-is-loading',
  templateUrl: './ai-is-loading.component.html',
  styleUrls: ['./ai-is-loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [style({ height: 0, opacity: 0 }), animate('0.3s ease-out', style({ height: 18, opacity: 1 }))]),
      transition(':leave', [style({ height: 18, opacity: 1 }), animate('0.3s ease-in', style({ height: 0, opacity: 0 }))]),
    ]),
  ],
})
export class AiIsLoadingComponent {
  @Input() isLoading?: boolean;
  @Input() fontSize = 16;

  @Input() text = 'AI is writting...';

  getStyle() {
    const style = {} as CSSStyleDeclaration;
    style.fontSize = `${this.fontSize}px`;
    return style;
  }
}
