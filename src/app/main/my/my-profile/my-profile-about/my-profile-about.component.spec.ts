import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProfileAboutComponent } from './my-profile-about.component';

describe('MyProfileAboutComponent', () => {
  let component: MyProfileAboutComponent;
  let fixture: ComponentFixture<MyProfileAboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyProfileAboutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyProfileAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
