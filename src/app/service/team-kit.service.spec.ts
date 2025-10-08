import { TestBed } from '@angular/core/testing';

import { TeamKitService } from './team-kit.service';

describe('TeamKitService', () => {
  let service: TeamKitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamKitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
