import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OfficialService } from './official.service';
import { environment } from '../../environments/environment';
import { Official } from '../models/official.model';

describe('OfficialService', () => {
  let service: OfficialService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/Official`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OfficialService]
    });
    service = TestBed.inject(OfficialService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch officials (getAll)', () => {
    const mockOfficials: Official[] = [
      { id: '1', first_name: 'John', last_name: 'Doe', official_type: 'REFEREE', license_number: 'ABC123', level: 'NATIONAL', status: 'ACTIVE' }
    ];

    service.getAll().subscribe((res) => {
      expect(res).toEqual(mockOfficials);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockOfficials);
  });

  it('should fetch one official (getById)', () => {
    const mockOfficial: Official = { id: '1', first_name: 'John', last_name: 'Doe', official_type: 'REFEREE', license_number: 'ABC123', level: 'NATIONAL', status: 'ACTIVE' };

    service.getById('1').subscribe((res) => {
      expect(res).toEqual(mockOfficial);
    });

    const req = httpMock.expectOne(`${apiUrl}/show/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOfficial);
  });

  it('should create official', () => {
    const newOfficial: Partial<Official> = { first_name: 'Jane', last_name: 'Smith', official_type: 'COMMISSIONER', license_number: 'XYZ456', level: 'REGIONAL', status: 'ACTIVE' };

    service.create(newOfficial).subscribe((res) => {
      expect(res).toEqual(jasmine.objectContaining(newOfficial));
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(newOfficial);
  });

  it('should update official', () => {
    const updatedOfficial: Partial<Official> = { level: 'INTERNATIONAL' };

    service.update('1', updatedOfficial).subscribe((res) => {
      expect(res.level).toBe('INTERNATIONAL');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...updatedOfficial, id: '1' });
  });

  it('should delete official', () => {
    service.delete('1').subscribe((res) => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne(`${apiUrl}/delete/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
