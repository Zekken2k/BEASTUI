import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngelsCompendium } from './angels-compendium';

describe('AngelsCompendium', () => {
  let component: AngelsCompendium;
  let fixture: ComponentFixture<AngelsCompendium>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngelsCompendium]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngelsCompendium);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
