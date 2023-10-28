import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MarkdownItService } from './markdown-it.service';

@Component({
  selector: 'app-markdown-it',
  templateUrl: './markdown-it.component.html',
  styleUrls: ['./markdown-it.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownItComponent {
  _markdown: string | undefined;

  @Output() ready = new EventEmitter<void>();

  @Input()
  set markdown(val: string) {
    this._markdown = val;
    this.render(this._markdown);
  }

  constructor(
    public element: ElementRef<HTMLElement>,
    private markdownService: MarkdownItService
  ) {}

  ngAfterViewInit(): void {
    if (this._markdown == null) {
      this.render(this.element.nativeElement.innerHTML.trim());
      return;
    } else {
      /*
       * This is probably done in markdown() setter, but because before the view is init, our component or parents ones
       *  are not in a safe state, we should signal again.
       */
      this.ready.emit();
      return;
    }
  }

  render(markdown: string): void {
    this.element.nativeElement.innerHTML =
      this.markdownService.render(markdown);
    this.ready.emit();
  }
}
