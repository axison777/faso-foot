import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisonDetailsComponent } from './saison-details.component';

describe('SaisonDetailsComponent', () => {
  let component: SaisonDetailsComponent;
  let fixture: ComponentFixture<SaisonDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaisonDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaisonDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
