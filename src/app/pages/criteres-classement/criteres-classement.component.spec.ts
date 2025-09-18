import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriteresClassementComponent } from './criteres-classement.component';

describe('CriteresClassementComponent', () => {
  let component: CriteresClassementComponent;
  let fixture: ComponentFixture<CriteresClassementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriteresClassementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriteresClassementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
