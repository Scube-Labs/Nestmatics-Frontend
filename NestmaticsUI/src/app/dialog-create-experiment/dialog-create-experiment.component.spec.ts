import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateExperimentComponent } from './dialog-create-experiment.component';

describe('DialogCreateExperimentComponent', () => {
  let component: DialogCreateExperimentComponent;
  let fixture: ComponentFixture<DialogCreateExperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogCreateExperimentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogCreateExperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
