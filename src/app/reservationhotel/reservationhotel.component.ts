import { Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCalendarCellCssClasses, MatCalendarCellClassFunction, MatCalendar} from '@angular/material/datepicker';
import { AuthService } from '../auth.service';



@Component({
  selector: 'app-reservationhotel',
  templateUrl: './reservationhotel.component.html',
  styleUrls: ['./reservationhotel.component.css']
})
export class ReservationhotelComponent implements OnInit {
    hotels: any[] = [];
    rooms: any[] = [];
    HotelID: number = 0;
    hotel: any = {};
    errorMessage: string = '';
    currentindex: number = 0;
    unavailableDates: Date[] = [];
    startDate: Date= new Date('01/01/2024');
    endDate: Date= new Date('01/01/2024');
    @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

    constructor(public authService: AuthService,
      private route: ActivatedRoute,
      private http: HttpClient, private router: Router
    ) {}
  
    ngOnInit(): void {
      this.fetchHotels()
      this.HotelID = parseInt(this.route.snapshot.paramMap.get('hotelid') || '0'); // Default to 0 if no hotelid provided
      this.loadHotelDetails();
      this.FetchRooms()

    }
    startDateChange(event: any) {
      // Extract only the date part from the event value and set it to startDate
      this.startDate = this.extractDate(event.value);
    }
    
    endDateChange(event: any) {
      // Extract only the date part from the event value and set it to endDate
      this.endDate = this.extractDate(event.value);
    }
    
    // Method to extract only the date part from a Date object
    private extractDate(date: Date): Date {
      const extractedDate = new Date(date);
      extractedDate.setHours(0, 0, 0, 0); // Set time to midnight
      return extractedDate;
    }
    fetchHotels(): void {
      this.http.get<any[]>('http://localhost:3000/api/hotel')
        .subscribe({
          next: (data) => {
            this.hotels = data;
          },
          error: (error) => {
            console.error('Failed to fetch hotels:', error);
          }
        });
    }
    range(value: number): number[] {
      return Array.from({ length: value });
    }

    GetImages(imagePaths: string): string[] {

      if (imagePaths) {
        return imagePaths.split(',').map((path: string) => path.trim())
      }
      return []; // Return an empty array if imagePaths is falsy
    }
    checkLocation(location: string): void {
      const url = "https://www.google.com/maps?q=" + location;
      
      const img = new Image();
      img.src = url;
      
      img.onload = () => {
        window.location.href = url;
      };
      
      img.onerror = () => {
      };
    }

    FetchRooms(): void {
      // Implement logic to fetch available rooms based on hotelId
      this.http.get<any[]>(`http://localhost:3000/api/hotel/${this.HotelID}/rooms`)
        .subscribe({
          next: (data) => {
            
            this.rooms = data;
            this.rooms.forEach(room => this.getUnavailableDates(room));

          },
          error: (error) => {
            if (error.status === 404) {
            } else {
              console.error('Failed to fetch rooms:', error);
            }
          }
        });
    }
    
    dateClass: MatCalendarCellClassFunction<Date> = (d: Date): MatCalendarCellCssClasses => {
      const formattedDate = this.formatDate(d); // Format the date as a string
      console.log('Checking date:', formattedDate);
      
      const isUnavailable = this.unavailableDates.some(unavailableDate => {
        const formattedUnavailableDate = this.formatDate(unavailableDate); // Format the unavailable date as a string
        return formattedUnavailableDate === formattedDate; // Compare the formatted dates
      });
      
      console.log('Is unavailable?', isUnavailable);
      
      return isUnavailable ? 'unavailable' : '';
    };
    
    // Method to format a date as a string in a comparable format
    private formatDate(date: Date): string {
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }
    
    
    
    reserveNow(hotel: any, room: any){
      if(!this.authService.isLoggedIn){
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      }else{
        if (!room || isNaN(room.Price) || room.Price <= 0) {
          alert('Invalid room price. Please select a valid room.');
          return;
        }
        this.http.post<any>('http://localhost:3000/api/initiate-payment', { amount: room.Price })
        .subscribe(
          (response) => {
            const stats = {
              TotalReservations: 1,
              TotalRevenue: 0, 
              TotalListings: 0,
              CompletedBookings: 0,
              DateAdded: new Date().toISOString(),
              bookingType: hotel.HotelType,
            };
          this.http.post<any>('http://localhost:3000/api/addstat', stats)
            // Handle successful payment initiation
            console.log('Payment initiated:', response);
            if (response.redirectUrl) {
              // Open PayPal checkout page in a new popup window
              const popupWindow = window.open(response.redirectUrl, '_blank', 'width=600,height=600');
              if (popupWindow) {
                popupWindow.focus();
                console.log(response)
                console.log(response.orderId)
                this.http.post<any>('http://localhost:3000/api/capture-payment', { orderId: response.orderId })
                .subscribe(
                  (captureResponse) => {
                    console.log('Payment captured:', captureResponse);
                    alert('Payment successful. Your reservation has been confirmed.');
                    // Handle success
                  },
                  (captureError) => {
                    console.error('Failed to capture payment:', captureError);
                    alert('Failed to capture payment. Please try again later.');
                    // Handle capture error
                  }
                );

              } else {
                // Popup blocked, handle error
                console.error('Popup blocked');
              }
            } else {
              // Redirect URL not found in response, handle error
              console.error('Redirect URL not found');
            }
          },
          (error) => {
            // Handle payment initiation error
            console.error('Failed to initiate payment:', error);
          }
        );      }

    }
    getUanavailableDates(room: any): void {
      // Fetch unavailable dates from the API
      this.http.get<any[]>(`http://localhost:3000/api/hotel/${room.HotelID}/${room.RoomID}/unavailable-dates`)
        .subscribe({
          next: (data) => {
            // Process and store the unavailable dates
            const unavailableDates: Date[] = data.map(dateObj => new Date(dateObj.startDate));
            // Mark unavailable dates in the calendar
            this.markUnavailableDates();
          },
          error: (error) => {
            console.error('Failed to fetch unavailable dates:', error);
          }
        });
    }
 
    getUnavailableDates(room: any): void {
      this.http.get<any[]>(`http://localhost:3000/api/hotel/${room.HotelID}/${room.RoomID}/unavailable-dates`)
        .subscribe({
          next: (data) => {
            console.log("Raw data:", data);
            this.unavailableDates = [];
            data.forEach(dateObj => {
              const startDate = new Date(Date.parse(dateObj.startDate));
              const endDate = new Date(Date.parse(dateObj.endDate));
    
              // Add start date
              this.unavailableDates.push(new Date(startDate));
    
              // Add all dates in between start and end dates
              const currentDate = new Date(startDate);
              while (currentDate < endDate) {
                this.unavailableDates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1); // Increment date by 1 day
              }
            });
            console.log("Processed dates:", this.unavailableDates);
            this.markUnavailableDates();
          },
          error: (error) => {
            console.error('Failed to fetch unavailable dates:', error);
          }
        });
    }
    
    markUnavailableDates(): void {
      const formattedUnavailableDates: string[] = this.unavailableDates.map(date => {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      });
    
      // Call the calendar component method to mark the unavailable dates
      // Assuming you have a method named markDatesUnavailable in your calendar component
      // Pass the formattedUnavailableDates array to markDatesUnavailable method
      // Example: this.calendarComponent.markDatesUnavailable(formattedUnavailableDates);
    }
    
    
    
    GetWebsite(site: string): string {
        if(site && site.startsWith("http")){
          return site;
        }
        if(site && site.startsWith("www")){
          return 'https://'+ site;
        }
        else {return 'https://www.' + site;}
    }   

    loadHotelDetails() {
      this.http.get<Number>(`http://localhost:3000/api/hotel/${this.HotelID}`) // Replace with your hotel details endpoint
        .subscribe(hotel => {
          this.hotel = hotel;
        }, error => {
          this.errorMessage = 'Proprieté Non Trouvé';
        });
    }
    
  }
