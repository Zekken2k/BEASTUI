import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Covers } from './covers';

describe('Covers', () => {
  let component: Covers;
  let fixture: ComponentFixture<Covers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Covers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Covers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
