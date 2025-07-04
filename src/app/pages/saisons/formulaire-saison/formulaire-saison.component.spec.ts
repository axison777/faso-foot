import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaireSaisonComponent } from './formulaire-saison.component';

describe('FormulaireSaisonComponent', () => {
  let component: FormulaireSaisonComponent;
  let fixture: ComponentFixture<FormulaireSaisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaireSaisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulaireSaisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
