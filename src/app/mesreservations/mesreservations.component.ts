import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-mesreservations',
  templateUrl: './mesreservations.component.html',
  styleUrls: ['./mesreservations.component.css']
})
export class MesReservationsComponent implements OnInit {
  reservations: any[] = [];
  rooms: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private datePipe: DatePipe,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.fetchUserReservations();
  }

  fetchUserReservations() {
    const userId = this.authService.LoggedInUser.id;
    this.http.get<any[]>(`http://localhost:3000/api/reservations/user/${userId}`)
      .subscribe(reservations => {
        this.reservations = reservations;
        const roomIds = reservations.map(r => ({
          id: r.id,
          suiteid: r.suiteid,
          hotelid: r.hotelid,
          creationdate: new Date(r.reservation_date)
        }));
        this.fetchRooms(roomIds);
      }, error => {
        console.error('Failed to fetch reservations:', error);
      });
  }

  fetchRooms(reservationIds: { id: number, suiteid: string, hotelid: string, creationdate: Date }[]): void {
    const roomRequests = reservationIds.map(ids =>
      this.http.get<any>(`http://localhost:3000/api/hotel/${ids.hotelid}/room/${ids.suiteid}`)
        .toPromise()
        .then(room => {
          room.hotelid = ids.hotelid;
          room.reservationid = ids.id;
          room.creationdate = ids.creationdate;
          room.startDate = this.datePipe.transform(room.startDate, 'dd/MM/yyyy');
          room.endDate = this.datePipe.transform(room.endDate, 'dd/MM/yyyy');
          room.hoursLeft = this.calculateHoursLeft(ids.creationdate); // calculate hours until cancellation
          this.rooms.push(room);
          return room;
        })
    );

    Promise.all(roomRequests)
      .then(rooms => {
        console.log('All rooms fetched', rooms);
      })
      .catch(error => {
        console.error('Failed to fetch rooms:', error);
      });
  }

  calculateHoursLeft(creationDate: Date): number {
    const cancelHours = 48; // auto cancel after 48 hours
    const now = new Date();
    const created = new Date(creationDate);
    const diff = (cancelHours * 60 * 60 * 1000) - (now.getTime() - created.getTime());
    return diff > 0 ? Math.floor(diff / (1000 * 60 * 60)) : 0;
  }

  reserveNow(hotel: any, room: any) {
    if (!room || isNaN(room.Price) || room.Price <= 0) {
      alert('Invalid room price. Please select a valid room.');
      return;
    }

    const userId = this.authService.LoggedInUser.id;
    const suiteId = room.RoomID;

    // Check for existing reservation
    this.http.get<any[]>(`http://localhost:3000/api/reservations/user/${userId}/room/${suiteId}`)
      .subscribe(reservations => {
        if (reservations.length > 0) {
          alert('Vous avez déjà réservé cette chambre. Pour changer de date, vous devez annuler l\'ancienne réservation.');
        } else {
          const data = {
            userid: userId,
            start_date: new Date(room.startDate).toISOString().split('T')[0],
            end_date: new Date(room.endDate).toISOString().split('T')[0],
            suiteid: suiteId,
            hotelid: hotel.HotelID,
            price: room.Price,
            reservation_date: new Date().toISOString().split('T')[0],
          };
          this.http.post<any>('http://localhost:3000/api/reservations', data)
            .subscribe(response => {
              this.router.navigate(['/mesreservations']);
            }, error => {
              console.error('Failed to make reservation:', error);
            });
        }
      });
  }
}
