import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-demo-sidebar',
  templateUrl: './demo-sidebar.component.html',
  styleUrls: ['./demo-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoSidebarComponent {
  isCollapsed = false;
}
