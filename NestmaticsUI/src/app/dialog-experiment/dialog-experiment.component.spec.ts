import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogExperimentComponent } from './dialog-experiment.component';

describe('DialogExperimentComponent', () => {
  let component: DialogExperimentComponent;
  let fixture: ComponentFixture<DialogExperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogExperimentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogExperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
