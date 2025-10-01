import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchSetupComponent } from './match-setup.component';

describe('MatchSetupComponent', () => {
  let component: MatchSetupComponent;
  let fixture: ComponentFixture<MatchSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
