import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiarioTohka } from './diario-tohka';

describe('DiarioTohka', () => {
  let component: DiarioTohka;
  let fixture: ComponentFixture<DiarioTohka>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiarioTohka]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiarioTohka);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
