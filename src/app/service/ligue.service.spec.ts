import { TestBed } from '@angular/core/testing';

import { LigueService } from './ligue.service';

describe('LigueService', () => {
  let service: LigueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LigueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
