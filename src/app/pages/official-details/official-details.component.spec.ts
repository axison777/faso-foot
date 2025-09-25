import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficialDetailsComponent } from './official-details.component';

describe('OfficialDetailsComponent', () => {
  let component: OfficialDetailsComponent;
  let fixture: ComponentFixture<OfficialDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficialDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficialDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
