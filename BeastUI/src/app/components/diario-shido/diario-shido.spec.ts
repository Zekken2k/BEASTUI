import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiarioShido } from './diario-shido';

describe('DiarioShido', () => {
  let component: DiarioShido;
  let fixture: ComponentFixture<DiarioShido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiarioShido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiarioShido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
