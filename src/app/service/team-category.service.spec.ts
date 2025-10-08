import { TestBed } from '@angular/core/testing';

import { TeamCategoryService } from './team-category.service';

describe('TeamCategoryService', () => {
  let service: TeamCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
