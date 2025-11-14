import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';


import { NgForm } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HotelDataService } from '../hotel-data.service';
import { Router, NavigationExtras } from '@angular/router';
@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
  hotels: any[] = [];
  hotel: any = {};
  approvedHotels: any[] = [];
  unapprovedHotels: any[] = [];
  showAddHotelForm: boolean = false;
  editingHotel: number | undefined; // Property to track the currently selected hotel for editing
  idexist: boolean = false;
  idNotExist: boolean = false; // Variable to indicate if the selected user ID does not exist
  uniqueFilename: any = {}
  imagePreviews: string[] = [];
  formData = new FormData();
  selectedFiles: File[] = [];
  existantFiles: File[] = [];
  maxuploaded: boolean = false;
  roomlength: any = {}; // Initialize roomlength as an empty object


  // Track uploaded image paths for each spot
  errimg: boolean = false;
  roomlen: any = {} ;
  
  constructor(    private hotelDataService: HotelDataService, private http: HttpClient,  public authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.approvedHotels = this.hotels.filter(hotel => hotel.APPROVED);
    this.unapprovedHotels = this.hotels.filter(hotel => !hotel.APPROVED);
    this.fetchHotels();
  }

  getAvailableRooms(hotel: any) {
    // Implement logic to fetch available rooms based on hotelId
    this.http.get<any[]>(`http://localhost:3000/api/hotel/${hotel.HotelID}/rooms`)
          .subscribe(
            (roomsData) => {
              if(roomsData && roomsData.length>0){
              this.roomlength[hotel.HotelID] = roomsData.length;
            }
            else { this.roomlength[hotel.HotelID] = 0}
          },
            (roomsError) => {
              console.error('Failed to fetch rooms for hotel:', hotel.HotelID, roomsError);
            }
          );
  }







  fetchHotels(): void {
    this.http.get<any[]>('http://localhost:3000/api/hotel').subscribe({
      next: (data) => {
        this.hotels = data;
        // Iterate through each hotel
        this.hotels.forEach(hotel => {
          // Fetch rooms for the current hotel
          this.http.get<any[]>(`http://localhost:3000/api/hotel/${hotel.HotelID}/rooms`)
            .subscribe(
              (roomsData) => {
                if (roomsData && roomsData.length > 0) {
                  hotel.roomlength = roomsData.length;
                } else {
                  hotel.roomlength = 0;
                }
              },
              (roomsError) => {
                console.error('Failed to fetch rooms for hotel:', hotel.HotelID, roomsError);
              }
            );
        });
        this.approvedHotels = this.hotels.filter(hotel => hotel.APPROVED);
        this.unapprovedHotels = this.hotels.filter(hotel => !hotel.APPROVED);
      },
      error: (error) => {
        console.error('Failed to fetch hotels:', error);
      }
    });
  }
  

  toggleAddHotelForm(): void {
    this.showAddHotelForm = !this.showAddHotelForm;
  }

  reupload(){
    this.selectedFiles = [];
    this.existantFiles = [];
    this.maxuploaded = false;
    this.errimg = false;
    this.imagePreviews = [];
  }
  
  handleFilesInput(event: any) {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles.length + this.existantFiles.length > 6) {
      this.errimg = true;
      return;
     } else {
      this.errimg = false;
    }
  
 // Concatenate new files with existing files
 for (let file of this.selectedFiles) {
  this.existantFiles.push(file);
}

if (this.existantFiles.length == 6) {
  // Notify user if more than 6  files are selected
  this.maxuploaded = true  // Remove excess files beyond the limit
  this.existantFiles = this.existantFiles.slice(0, 6);
}

// Preview all files
for (let file of this.selectedFiles) {
  this.previewImage(file);
}

}

  uploadImages(hotelId: number) { // Pass hotelId as a parameter
    for (let file of this.existantFiles) {
        const now = new Date().toISOString().replace(/[éèêËÄâ§<>:"|?*\\'`{}.\[\]()/@#&%^$!+]/g, '-');
        this.uniqueFilename = `HotelID-${this.authService.LoggedInUser.id}-${now}-HotelImage$-${file.name}`;
        this.formData.append('images', file, this.uniqueFilename);
    }
    // Pass hotelId as a parameter in the URL
    this.http.post(`http://localhost:3000/api/uploadtohotel/${hotelId}`, this.formData, { responseType: 'text' }).subscribe(
        (res) => {
            console.log(res); // Logs the success message
        },
        (err) => {
            console.error(err); // Logs any error
        }
    );
}
  previewImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviews.push(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
  
  addroom(hotel: any){
    this.hotelDataService.setSelectedHotel(hotel); // Set selected hotel in service
    this.router.navigate(['/addroom']);
  }

editHotel(hotel: any): void {
  this.editingHotel = hotel.HotelID;
}

cancelEdit(): void {
  this.hotel = null;
  this.editingHotel = undefined;
}

saveHotel(hotel: any): void {
  if (this.hotel && this.editingHotel == hotel.HotelID) {
    const updatedHotelData = {
      HotelName: this.hotel.HotelName || hotel.HotelName,
      Description: this.hotel.Description || hotel.Description,
      AddressLine1: this.hotel.AddressLine1 || hotel.AddressLine1,
      AddressLine2: this.hotel.AddressLine2 || hotel.AddressLine2,
      City: this.hotel.City || hotel.City,
      PostalCode: this.hotel.PostalCode || hotel.PostalCode,
      Country: this.hotel.Country || hotel.Country,
      PhoneNumber: this.hotel.PhoneNumber || hotel.PhoneNumber,
      Website: this.hotel.Website || hotel.Website,
      Email: this.hotel.Email || hotel.Email,
      StarRating: parseFloat(this.hotel.StarRating || hotel.StarRating),
      localisation: this.hotel.localisation || hotel.localisation,
    };
        this.idexist = true;
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        const headers = { 'x-access-token': token  || ''}; // Include token in headers
        this.http.put<any>('http://localhost:3000/api/hotel/' + hotel.HotelID, updatedHotelData, { headers })
        .subscribe({
          next: (data) => {
            console.log('Hotel updated successfully !');
            this.fetchHotels(); // Refresh the list of hotels
            this.hotel = null; // Reset selected hotel
            this.editingHotel = undefined;
          },
          error: (error) => {
            console.error('Failed to update hotel:', error);
          }
        });
           
    
  }
 }


  deleteHotel(hotel: any): void {
    this.fetchHotels(); // Refresh the list of hotels
    const imagePaths = hotel.image_paths;

    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    const headers = { 'x-access-token': token  || ''}; // Include token in headers
    const requestBody = {
      hotelId: hotel.HotelID,
      imagePaths: imagePaths
    };
  
    this.http.delete<any>('http://localhost:3000/api/hotel/' + hotel.HotelID, { 
      headers,
      body: requestBody // Include the request body
    }).subscribe({
      next: (data) => {
        console.log('Hotel deleted successfully !');
        this.fetchHotels(); // Refresh the list of hotels
      },
      error: (error) => {
        console.error('Failed to delete hotel:', error);
      }
    });
  }
}
