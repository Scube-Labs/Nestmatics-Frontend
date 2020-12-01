import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropStrategyComponent } from './drop-strategy.component';

describe('DropStrategyComponent', () => {
  let component: DropStrategyComponent;
  let fixture: ComponentFixture<DropStrategyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropStrategyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropStrategyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
