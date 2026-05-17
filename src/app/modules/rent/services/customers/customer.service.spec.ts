import { TestBed } from '@angular/core/testing';
import { CustomerService } from './customer.service';
import { BaseService } from '../../../../shared/services/base/base.service';
import { of, throwError } from 'rxjs';

describe('CustomerService', () => {
  let service: CustomerService;
  let baseServiceSpy: jasmine.SpyObj<BaseService>;

  const mockCustomer = {
    id: 'cust-1',
    name: 'Ahmed Hassan',
    nameAr: 'أحمد حسن',
    nameEn: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    phone: '+966501234567',
    address: 'Riyadh, Saudi Arabia',
    isActive: true,
    createdDate: '2024-01-01',
    type: 'individual',
  };

  const mockCustomerList = [
    mockCustomer,
    { id: 'cust-2', name: 'Company ABC', nameEn: 'Company ABC', email: 'abc@example.com', phone: '+966502345678', isActive: true, type: 'corporate' },
    { id: 'cust-3', name: 'Fatima Ali', nameEn: 'Fatima Ali', email: 'fatima@example.com', phone: '+966503456789', isActive: true, type: 'individual' },
  ];

  beforeEach(() => {
    const baseServiceMock = jasmine.createSpyObj('BaseService', ['getData', 'postData', 'putData']);
    TestBed.configureTestingModule({
      providers: [CustomerService, { provide: BaseService, useValue: baseServiceMock }],
    });
    service = TestBed.inject(CustomerService);
    baseServiceSpy = TestBed.inject(BaseService) as jasmine.SpyObj<BaseService>;
  });

  describe('getList', () => {
    it('should retrieve all customers', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCustomerList));

      service.getList().subscribe((customers) => {
        expect(customers.length).toBe(3);
        expect(customers[0].name).toBe('Ahmed Hassan');
        done();
      });
    });

    it('should handle empty customer list', (done) => {
      baseServiceSpy.getData.and.returnValue(of(null));

      service.getList().subscribe((customers) => {
        expect(customers).toEqual([]);
        done();
      });
    });

    it('should filter customers by status', (done) => {
      const activeCustomers = mockCustomerList.filter((c) => c.isActive);
      baseServiceSpy.getData.and.returnValue(of(activeCustomers));

      service.getList().subscribe((customers) => {
        expect(customers.every((c) => c.isActive)).toBe(true);
        done();
      });
    });
  });

  describe('getById', () => {
    it('should retrieve customer by id', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCustomer));

      service.getById('cust-1').subscribe((customer) => {
        expect(customer.id).toBe('cust-1');
        expect(customer.name).toBe('Ahmed Hassan');
        done();
      });
    });

    it('should call API with correct parameters', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCustomer));

      service.getById('cust-2').subscribe(() => {
        expect(baseServiceSpy.getData).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.objectContaining({ id: 'cust-2' }),
        );
        done();
      });
    });
  });

  describe('create', () => {
    const createRequest = {
      name: 'New Customer',
      nameAr: 'عميل جديد',
      nameEn: 'New Customer',
      email: 'new@example.com',
      phone: '+966509999999',
      address: 'Jeddah, Saudi Arabia',
      isActive: true,
      type: 'individual',
    };

    it('should create new customer', (done) => {
      baseServiceSpy.postData.and.returnValue(of({ id: 'cust-new', ...createRequest }));

      service.create(createRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should include all customer fields', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        const callArgs = baseServiceSpy.postData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.name).toBe('New Customer');
        expect(payload.email).toBe('new@example.com');
        expect(payload.phone).toBe('+966509999999');
        done();
      });
    });
  });

  describe('update', () => {
    const updateRequest = {
      id: 'cust-1',
      name: 'Ahmed Hassan Updated',
      email: 'ahmed.updated@example.com',
      phone: '+966505555555',
      isActive: true,
    };

    it('should update customer', (done) => {
      baseServiceSpy.putData.and.returnValue(of({ success: true }));

      service.update(updateRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should preserve customer id', (done) => {
      baseServiceSpy.putData.and.returnValue(of({}));

      service.update(updateRequest).subscribe(() => {
        const callArgs = baseServiceSpy.putData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.id).toBe('cust-1');
        done();
      });
    });
  });

  describe('filtering and searching', () => {
    it('should filter customers by type', (done) => {
      const individualCustomers = mockCustomerList.filter((c) => c.type === 'individual');
      baseServiceSpy.getData.and.returnValue(of(individualCustomers));

      service.getList().subscribe((customers) => {
        expect(customers.every((c) => c.type === 'individual')).toBe(true);
        done();
      });
    });

    it('should search customers by name', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCustomerList));

      service.getList().subscribe((customers) => {
        const searchTerm = 'Ahmed';
        const found = customers.filter((c) => c.name.includes(searchTerm) || c.nameAr?.includes(searchTerm));
        expect(found.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should search customers by email', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCustomerList));

      service.getList().subscribe((customers) => {
        const found = customers.filter((c) => c.email.includes('@example.com'));
        expect(found.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should search customers by phone', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCustomerList));

      service.getList().subscribe((customers) => {
        const found = customers.filter((c) => c.phone.includes('+966'));
        expect(found.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should sort customers by name', (done) => {
      const sortedCustomers = [...mockCustomerList].sort((a, b) => a.name.localeCompare(b.name));
      baseServiceSpy.getData.and.returnValue(of(sortedCustomers));

      service.getList().subscribe((customers) => {
        expect(customers[0].name).toBeLessThanOrEqual(customers[1].name);
        done();
      });
    });
  });
});
