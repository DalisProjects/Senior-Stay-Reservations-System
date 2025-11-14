import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelDataService {

  private selectedHotelSource = new BehaviorSubject<any>(null);
  selectedHotel$ = this.selectedHotelSource.asObservable();

  setSelectedHotel(hotel: any) {
    this.selectedHotelSource.next(hotel);
  }
}
