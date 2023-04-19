import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsMainSidebarComponent } from './groups-main-sidebar.component';

describe('GroupsMainSidebarComponent', () => {
  let component: GroupsMainSidebarComponent;
  let fixture: ComponentFixture<GroupsMainSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsMainSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsMainSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
