import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagehotelsComponent } from './managehotels.component';

describe('ManagehotelsComponent', () => {
  let component: ManagehotelsComponent;
  let fixture: ComponentFixture<ManagehotelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagehotelsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManagehotelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
