import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionUpgradeHeaderComponent } from './version-upgrade-header.component';

describe('VersionUpgradeHeaderComponent', () => {
  let component: VersionUpgradeHeaderComponent;
  let fixture: ComponentFixture<VersionUpgradeHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VersionUpgradeHeaderComponent]
    });
    fixture = TestBed.createComponent(VersionUpgradeHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
