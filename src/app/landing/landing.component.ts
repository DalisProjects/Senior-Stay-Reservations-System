import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  currentBannerIndex = 0;
  currenthotelindex = 0;
  currentIndex = 0;
  bannerTimer: any;
  searchlocation: string = '';
  maxOccupancy: number | undefined;
  selectedRoomType: string | undefined;
  hotel: any [] = [];
  hotels: any [] = [];
  err: boolean = false;
  imgpths: string ='';
  timer: any;
  filteredrooms: any [] = [];
  filteredhotels: any [] = [];
  filtrage: boolean = false;
  pricefilter: number | undefined;
  typeFilter: string | undefined;


 
  constructor(public authService: AuthService, private http: HttpClient, public router: Router) {
  }
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
  fetchHotels(): void {
    this.http.get<any[]>('http://localhost:3000/api/hotel')
      .subscribe((data) => {
        console.log(data);
        this.hotels = data;
      }, (error) => {
        console.error('Failed to fetch hotels:', error);
      });
  }
  
  filtragech(){
    if(!this.filtrage){
      this.filtrage = true;
      this.err = false;
    }
    else {this.filtrage = false; this.err = false;
    }
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
  searchHotels(): void {

    // Initialize this.hotel as an empty array
    this.hotel = [];
  
    if ((!this.searchlocation || !this.searchlocation.trim()) && !this.typeFilter && !this.pricefilter && !this.maxOccupancy && !this.selectedRoomType) {
      this.err = true
      this.filtrage = false;
      return;
    }
    clearInterval(this.timer);
    clearInterval(this.bannerTimer);
    this.fetchHotels();
    const intervalDuration = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
    this.timer = setInterval(() => {
       this.currentIndex++;
       this.currentIndex %= this.imgpths.split(',').length;
    }, intervalDuration);
    this.err = false;
    if(this.searchlocation || this.typeFilter){
      this.filteredhotels = [];
      this.filteredhotels = this.hotels.filter(hotel =>
        ((!this.searchlocation || (hotel.Country && hotel.Country.toLowerCase().includes(this.searchlocation.toLowerCase())) ||
        (hotel.localisation && hotel.localisation.toLowerCase().includes(this.searchlocation.toLowerCase())) ||
        (hotel.addressLine2 && hotel.addressLine2.toLowerCase().includes(this.searchlocation.toLowerCase())) ||
        (hotel.addressLine1 && hotel.addressLine1.toLowerCase().includes(this.searchlocation.toLowerCase())) ||
        (hotel.City && hotel.City.toLowerCase().includes(this.searchlocation.toLowerCase()))) &&
        (!this.typeFilter || hotel.HotelType.toLowerCase() === this.typeFilter.toLocaleLowerCase())))
      if(this.filteredhotels.length < 1) {
        this.err = true;
        return;
      }
    }
  
    if((this.searchlocation || this.typeFilter) && !this.maxOccupancy && !this.selectedRoomType && !this.pricefilter){
      console.log("got here bitch", this.filteredhotels)
      this.hotel = this.filteredhotels;
      if(!this.hotel) {
        this.err = true;
        return;
      }
    }
    if((this.maxOccupancy || this.selectedRoomType || this.pricefilter) && !this.searchlocation && !this.typeFilter){
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
              }
              if (!this.hotel) {
                 this.err = true;

              }
              console.log("final log", this.hotel)
              // Handle filtered rooms data...
            }
            if(!this.hotel){
              this.err = true;
            }
          },
            (roomsError) => {
              console.error('Failed to fetch rooms for hotel:', hotel.HotelID, roomsError);
            }
          );
      });
    }  
  }

  
  
  
  
  searchHotelss(input: string): void {
    if (!input.trim() || !input) {
      this.err = true; 
      return;
    }
    clearInterval(this.timer);
    clearInterval(this.bannerTimer);
      this.fetchHotels();
      const intervalDuration = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
      this.timer = setInterval(() => {
         this.currentIndex++;
         this.currentIndex %= this.imgpths.split(',').length;
     }, intervalDuration);
      
    this.err = false;
    if(input){
      this.hotel = this.hotels.filter(hotel =>
        (hotel.HotelName && hotel.HotelName.toLowerCase().includes(input.toLowerCase())) ||
        (hotel.Country && hotel.Country.toLowerCase().includes(input.toLowerCase())) ||
        (hotel.localisation && hotel.localisation.toLowerCase().includes(input.toLowerCase())) ||
        (hotel.addressLine2 && hotel.addressLine2.toLowerCase().includes(input.toLowerCase())) ||
        (hotel.addressLine1 && hotel.addressLine1.toLowerCase().includes(input.toLowerCase())) ||
        (hotel.City && hotel.City.toLowerCase().includes(input.toLowerCase()))
      );
      if(this.hotel.length < 1) {       this.err = true;      }
  }
  }
  onBookRoom(Hotel: any) {

    // Instead of handling booking confirmation here, navigate to the booking details page
    this.router.navigateByUrl(`/reservation/${Hotel.HotelID}`);
  }
  getBackgroundImage(imagePaths: string): string {
    if (imagePaths) {
        this.imgpths = imagePaths;
        const paths = imagePaths.split(','); // Split the comma-separated paths
        return paths[this.currentIndex % paths.length]; // Return the background image path from the current index
    }
    return ''; // Return an empty string if no imagePaths are provided
   }

  prevSlide(): void {
    this.currenthotelindex = (this.currenthotelindex - 1 + this.hotel.length) % this.hotel.length;
  }
  
  nextSlide(): void {
    this.currenthotelindex = (this.currenthotelindex + 1) % this.hotel.length;
  }
  

}
