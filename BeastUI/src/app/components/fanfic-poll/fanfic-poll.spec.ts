import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanficPoll } from './fanfic-poll';

describe('FanficPoll', () => {
  let component: FanficPoll;
  let fixture: ComponentFixture<FanficPoll>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FanficPoll]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FanficPoll);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
