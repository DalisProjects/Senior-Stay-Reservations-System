import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationhotelComponent } from './reservationhotel.component';

describe('ReservationhotelComponent', () => {
  let component: ReservationhotelComponent;
  let fixture: ComponentFixture<ReservationhotelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReservationhotelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationhotelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
