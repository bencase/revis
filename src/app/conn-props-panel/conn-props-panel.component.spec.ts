import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnPropsPanelComponent } from './conn-props-panel.component';

describe('ConnPropsPanelComponent', () => {
  let component: ConnPropsPanelComponent;
  let fixture: ComponentFixture<ConnPropsPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnPropsPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnPropsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
