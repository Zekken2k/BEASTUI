import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityLink } from './community-link';

describe('CommunityLink', () => {
  let component: CommunityLink;
  let fixture: ComponentFixture<CommunityLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityLink]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityLink);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
