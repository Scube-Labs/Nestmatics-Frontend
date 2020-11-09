import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAreasComponent } from './dialog-areas.component';

describe('DialogAreasComponent', () => {
  let component: DialogAreasComponent;
  let fixture: ComponentFixture<DialogAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAreasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
