import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-show-hide-text',
  templateUrl: './show-hide-text.component.html',
  styleUrls: ['./show-hide-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowHideTextComponent {
  @Input() text?: string;
  @Input() showText = 'Show';

  @Input() show = false;

  onToggleClick() {
    this.show = !this.show;
  }
}
