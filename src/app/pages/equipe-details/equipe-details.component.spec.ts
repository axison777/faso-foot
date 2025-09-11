import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipeDetailsComponent } from './equipe-details.component';

describe('EquipeDetailsComponent', () => {
  let component: EquipeDetailsComponent;
  let fixture: ComponentFixture<EquipeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipeDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
