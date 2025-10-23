import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class StaffService {
    apiUrl=environment.apiUrl+'/staffs'

     constructor(private http: HttpClient) {}

     getAll(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
      }

      create(staff: Partial<any>): Observable<any> {
        return this.http.post<any>(this.apiUrl, staff);
      }

      update(id: string, staff: Partial<any>): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, staff);
      }

      delete(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
      }
}
