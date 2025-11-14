import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPropComponent } from './dashboard-prop.component';

describe('DashboardPropComponent', () => {
  let component: DashboardPropComponent;
  let fixture: ComponentFixture<DashboardPropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardPropComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
