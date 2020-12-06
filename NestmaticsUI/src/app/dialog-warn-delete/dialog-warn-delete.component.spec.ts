import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogWarnDeleteComponent } from './dialog-warn-delete.component';

describe('DialogWarnDeleteComponent', () => {
  let component: DialogWarnDeleteComponent;
  let fixture: ComponentFixture<DialogWarnDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogWarnDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogWarnDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
