import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportMatchComponent } from './export-match.component';

describe('ExportMatchComponent', () => {
  let component: ExportMatchComponent;
  let fixture: ComponentFixture<ExportMatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportMatchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
