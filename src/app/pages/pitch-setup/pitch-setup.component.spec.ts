import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PitchSetupComponent } from './pitch-setup.component';

describe('PitchSetupComponent', () => {
  let component: PitchSetupComponent;
  let fixture: ComponentFixture<PitchSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PitchSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PitchSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
