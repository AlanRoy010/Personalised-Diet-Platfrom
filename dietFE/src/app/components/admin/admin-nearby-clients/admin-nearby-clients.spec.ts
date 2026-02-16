import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNearbyClients } from './admin-nearby-clients';

describe('AdminNearbyClients', () => {
  let component: AdminNearbyClients;
  let fixture: ComponentFixture<AdminNearbyClients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNearbyClients]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNearbyClients);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
