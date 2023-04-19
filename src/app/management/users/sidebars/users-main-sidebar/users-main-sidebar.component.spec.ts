import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersMainSidebarComponent } from './users-main-sidebar.component';

describe('UsersMainSidebarComponent', () => {
  let component: UsersMainSidebarComponent;
  let fixture: ComponentFixture<UsersMainSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersMainSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersMainSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
