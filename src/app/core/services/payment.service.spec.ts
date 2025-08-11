import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { ApiService } from './api.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [ApiService, PaymentService] });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should get plans', () => {
    service.getSubscriptionPlans().subscribe(plans => {
      expect(plans).toBeTruthy();
      expect(Array.isArray(plans)).toBeTrue();
    });
    const req = httpMock.expectOne('/api/v1/subscription/plans');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should subscribe using plan_type and token', () => {
    service.subscribeToPlan({ plan_id: 2 as any, plan_type: 'premium' as any, currency: 'USD', payment_method: 'stripe', payment_token: 'pm_123' } as any).subscribe(sub => {
      expect(sub).toBeTruthy();
    });
    const req = httpMock.expectOne('/api/v1/subscription/subscribe');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.plan_type).toBe('premium');
    req.flush({ success: true, data: { id: 1, plan_type: 'premium', status: 'active' } });
  });
});


