import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamCategoriesComponent } from './team-categories.component';

describe('TeamCategoriesComponent', () => {
  let component: TeamCategoriesComponent;
  let fixture: ComponentFixture<TeamCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
