import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedisContentComponent } from './redis-content.component';

describe('RedisContentComponent', () => {
  let component: RedisContentComponent;
  let fixture: ComponentFixture<RedisContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedisContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedisContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
