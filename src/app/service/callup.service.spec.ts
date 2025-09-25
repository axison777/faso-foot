import { TestBed } from '@angular/core/testing';

import { CallupService } from './callup.service';

describe('CallupService', () => {
  let service: CallupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CallupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
