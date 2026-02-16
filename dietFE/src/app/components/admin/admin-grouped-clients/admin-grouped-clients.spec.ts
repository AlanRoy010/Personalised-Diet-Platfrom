import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGroupedClients } from './admin-grouped-clients';

describe('AdminGroupedClients', () => {
  let component: AdminGroupedClients;
  let fixture: ComponentFixture<AdminGroupedClients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminGroupedClients]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminGroupedClients);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
