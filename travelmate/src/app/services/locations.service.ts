import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocationData } from '../interfaces/locationdata'; 

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private apiUrl = 'http://localhost:3000/locations';

  constructor(private http: HttpClient) {}

  createLocation(data: LocationData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllLocations(): Observable<LocationData[]> {
    return this.http.get<LocationData[]>(this.apiUrl);
  }
  getUserWishlist(email: string): Observable<LocationData[]> {
  return this.http.get<LocationData[]>(`${this.apiUrl}/user/${email}?wishlist=true`);
}

}
