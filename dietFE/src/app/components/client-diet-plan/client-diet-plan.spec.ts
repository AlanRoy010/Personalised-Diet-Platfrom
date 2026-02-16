import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDietPlan } from './client-diet-plan';

describe('ClientDietPlan', () => {
  let component: ClientDietPlan;
  let fixture: ComponentFixture<ClientDietPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDietPlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientDietPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
