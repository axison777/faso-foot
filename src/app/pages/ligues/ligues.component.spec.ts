import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiguesComponent } from './ligues.component';

describe('LiguesComponent', () => {
  let component: LiguesComponent;
  let fixture: ComponentFixture<LiguesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiguesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiguesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
