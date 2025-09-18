import { TestBed } from '@angular/core/testing';

import { ClassementService } from './classement.service';

describe('ClassementService', () => {
  let service: ClassementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
