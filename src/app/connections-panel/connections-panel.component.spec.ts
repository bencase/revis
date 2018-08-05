import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionsPanelComponent } from './connections-panel.component';

describe('ConnectionsPanelComponent', () => {
  let component: ConnectionsPanelComponent;
  let fixture: ComponentFixture<ConnectionsPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectionsPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
