import { TestBed } from '@angular/core/testing';

import { StaffContractService } from './staff-contract.service';

describe('StaffContractService', () => {
  let service: StaffContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaffContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
