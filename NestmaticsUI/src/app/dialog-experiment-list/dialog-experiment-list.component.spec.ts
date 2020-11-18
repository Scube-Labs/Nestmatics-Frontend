import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogExperimentListComponent } from './dialog-experiment-list.component';

describe('DialogExperimentListComponent', () => {
  let component: DialogExperimentListComponent;
  let fixture: ComponentFixture<DialogExperimentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogExperimentListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogExperimentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
