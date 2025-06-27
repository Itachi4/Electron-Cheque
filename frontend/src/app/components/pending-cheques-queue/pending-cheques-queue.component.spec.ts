import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingChequesQueueComponent } from './pending-cheques-queue.component';

describe('PendingChequesQueueComponent', () => {
  let component: PendingChequesQueueComponent;
  let fixture: ComponentFixture<PendingChequesQueueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingChequesQueueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingChequesQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
