import { TestBed } from '@angular/core/testing';

import { MatchDayService } from './match-day.service';

describe('MatchDayService', () => {
  let service: MatchDayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchDayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
