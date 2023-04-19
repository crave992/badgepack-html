import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgesMainSidebarComponent } from './badges-main-sidebar.component';

describe('BadgesMainSidebarComponent', () => {
  let component: BadgesMainSidebarComponent;
  let fixture: ComponentFixture<BadgesMainSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BadgesMainSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgesMainSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
