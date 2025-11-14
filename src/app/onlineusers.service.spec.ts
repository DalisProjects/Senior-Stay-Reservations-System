import { TestBed } from '@angular/core/testing';

import { OnlineusersService } from './onlineusers.service';

describe('OnlineusersService', () => {
  let service: OnlineusersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnlineusersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
