import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';



@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  hotels: any[] = [];
  currentIndex = 0;
  timer: any;
  imgpths: string ='';
    err: boolean = false;
    filteredrooms: any [] = [];
    filteredhotels: any [] = [];
    searchlocation: string | undefined;
    maxOccupancy: number | undefined;
    pricefilter: number | undefined;
    namefilter: string | undefined;
    selectedRoomType: string | undefined;
    hotel: any [] = [];
    bannerTimer: any;
    filtrage: boolean = false;
    foundhotels: boolean = false;
    ClickedType: string | null = null;
    typeclass: string | null = null;



  constructor(public authService:AuthService, public nav:Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchHotels();
    const intervalDuration = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
   this.timer = setInterval(() => {
      this.currentIndex++;
      this.currentIndex %= this.imgpths.split(',').length;
  }, intervalDuration);
  }
  ngOnDestroy(): void{
    clearInterval(this.timer);
   clearInterval(this.bannerTimer);
 }

 filterType(type: string): void {
  if(this.ClickedType == type){
    this.typeclass = null;
    this.filtrage = false;
    this.err = false;
    this.foundhotels = false;
    this.ClickedType = null;
    this.fetchHotels();
  }
  else{
  if(type === "guesthouses"){
    type = "Maison D'Hôtes";
    this.typeclass = "hotes";
  }
  else {this.typeclass = ""; }
  this.filtrage = false;
  this.err = false;
  this.foundhotels = false;
  this.ClickedType = type;
  this.fetchHotels()
  }

}
  filtragech(){
    if(!this.filtrage){
      this.filtrage = true;
      this.err = false;
    }
    else {this.filtrage = false; this.err = false; this.foundhotels = false;
    }
  }
  searchHotels(): void {

    // Initialize this.hotel as an empty array
    this.hotel = [];
  
    if ((!this.searchlocation || !this.searchlocation.trim()) && (!this.namefilter || !this.namefilter.trim()) && !this.pricefilter && !this.maxOccupancy && !this.selectedRoomType) {
      this.err = true
      this.filtrage = false;
      this.foundhotels = false;
      return;
    }
    this.foundhotels = false;
    clearInterval(this.timer);
    clearInterval(this.bannerTimer);
    this.fetchHotels();
    const intervalDuration = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
    this.timer = setInterval(() => {
       this.currentIndex++;
       this.currentIndex %= this.imgpths.split(',').length;
    }, intervalDuration);
    this.err = false;
    if(this.searchlocation || this.namefilter){
      this.filteredhotels = [];
      this.filteredhotels = this.hotels.filter(hotel =>
        ((!this.searchlocation || (hotel.Country && hotel.Country.toLowerCase().includes(this.searchlocation.toLowerCase())) ||
        (hotel.localisation && hotel.localisation.toLowerCase().includes(this.searchlocation.toLowerCase())) ||
        (hotel.addressLine2 && hotel.addressLine2.toLowerCase().includes(this.searchlocation.toLowerCase())) ||
        (hotel.addressLine1 && hotel.addressLine1.toLowerCase().includes(this.searchlocation.toLowerCase())) ||
        (hotel.City && hotel.City.toLowerCase().includes(this.searchlocation.toLowerCase()))) &&
        (!this.namefilter || hotel.HotelName.toLowerCase().includes(this.namefilter))))
      if(this.filteredhotels.length < 1) {
        this.err = true;
        return;
      }
    }
  
    if((this.searchlocation || this.namefilter) && !this.maxOccupancy && !this.selectedRoomType && !this.pricefilter){
      console.log("got here bitch", this.filteredhotels)
      this.hotel = this.filteredhotels;
      this.foundhotels = true;
      this.filtrage = true;
      if(this.hotel.length < 1) {
        this.err = true;
        return;
      }
    }
    if((this.maxOccupancy || this.selectedRoomType || this.pricefilter) && !this.searchlocation && !this.namefilter){
      this.filteredhotels = this.hotels;
    }

  
    if (this.maxOccupancy || this.selectedRoomType || this.pricefilter) {
     console.log(this.pricefilter)
      this.filteredhotels.forEach(hotel => {
        this.http.get<any[]>(`http://localhost:3000/api/hotel/${hotel.HotelID}/rooms`)
          .subscribe(
            (roomsData) => {
              if(roomsData && roomsData.length>0){
              console.log("for ", hotel.HotelID, "roomdata ", roomsData)
              // Initialize filteredrooms as an empty array for the current hotel
              hotel.filteredrooms = [];
              // Filter rooms based on maximum occupancy and room type
              hotel.filteredrooms = roomsData.filter(room =>
                (!this.maxOccupancy || (room.HotelID === hotel.HotelID && room.MaxOccupancy >= this.maxOccupancy)) &&
                (!this.selectedRoomType || (room.HotelID === hotel.HotelID && room.RoomType === this.selectedRoomType)) &&
                (!this.pricefilter || (room.HotelID === hotel.HotelID && Number(room.Price) <= Number(this.pricefilter)))
              );
  
              // Filter hotels that have rooms with the specified max occupancy and room type
              if (hotel.filteredrooms.length > 0) {
                this.hotel.push(hotel);
                this.filtrage = true;
                this.foundhotels = true;
              }
              if (!this.hotel || this.hotel.length <  1) {
                 this.err = true;
                 this.filtrage = false;
                 this.foundhotels = false;

              }
              console.log("final log", this.hotel)
              // Handle filtered rooms data...
            }
            if(!this.hotel){
              this.err = true;
                 this.filtrage = false;
                 this.foundhotels = false;
            }
          },
            (roomsError) => {
              console.error('Failed to fetch rooms for hotel:', hotel.HotelID, roomsError);
            }
          );
      });
    }  
  }

  onBookRoom(Hotel: any) {

    // Instead of handling booking confirmation here, navigate to the booking details page
    this.nav.navigateByUrl(`/reservation/${Hotel.HotelID}`);
  }
  getBackgroundImage(imagePaths: string): string {
    if (imagePaths) {
        this.imgpths = imagePaths;
        const paths = imagePaths.split(','); // Split the comma-separated paths
        return paths[this.currentIndex % paths.length]; // Return the background image path from the current index
    }
    return ''; // Return an empty string if no imagePaths are provided
   }


  slideToNext(): void {
    this.currentIndex = (this.currentIndex + 1) % this.hotels.length; // Increment index and wrap around
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
  fetchHotels(): void {
    this.http.get<any[]>('http://localhost:3000/api/hotel')
      .subscribe({
        next: (data) => {
          if (this.ClickedType) {
            console.log(this.ClickedType)
            this.hotels = data.filter(hotel => hotel.HotelType === this.ClickedType);
          } else {
            this.hotels = data;
          }
        },
        error: (error) => {
          console.error('Failed to fetch hotels:', error);
        }
      });
  }
}