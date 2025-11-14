import { AuthService } from '../auth.service';


import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { NgForm } from '@angular/forms';



@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})
export class AddPostComponent {
  hotels: any[] = [];
  newHotel: any = {};
  selectedHotel: any = null; // Property to track the currently selected hotel for editing
  selectedFiles: File[] = [];
  existantFiles: File[] = [];
  maxuploaded: boolean = false;
  // Track uploaded image paths for each spot
  uniqueFilename: any = {}
  imagePreviews: string[] = [];
  formData = new FormData();
  errimg: boolean = false;
  hoteladded: boolean = false;




  constructor(private http: HttpClient, public authService: AuthService, public nav:Router) { }

  onInit(){
    this.hoteladded = false;

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
    for (let file of this.selectedFiles) {
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


  

    
  addHotel(reg: NgForm) {
    const HotelData = {
      OwnerID: this.authService.LoggedInUser.id,
      HotelName: reg.value.HotelName,
      HotelType: reg.value.HotelType,
      Description: reg.value.Description,
      AddressLine1: reg.value.AddressLine1,
      AddressLine2: reg.value.AddressLine2,
      City: reg.value.City,
      APPROVED: 0,
      PostalCode: reg.value.PostalCode,
      Country: reg.value.Country,
      PhoneNumber: reg.value.PhoneNumber,
      Website: reg.value.Website,
      Email: reg.value.Email,
      StarRating: parseFloat(reg.value.StarRating) || 0,
      localisation: reg.value.localisation,
    };

  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  const headers = { 'x-access-token': token || ''}; // Include token in headers

  this.http.post<any>('http://localhost:3000/api/hotel', HotelData, { headers })
  .subscribe({
    next: (data) => {
      const stats = {
        TotalReservations: 0,
        TotalRevenue: 0, 
        TotalListings: 1,
        CompletedBookings: 0,
        DateAdded: new Date().toISOString(),
        bookingType: reg.value.HotelType,
      };
    this.http.post<any>('http://localhost:3000/api/addstat', stats)
      this.hoteladded = true;
      console.log('Hotel added successfully !');
      this.uploadImages(data.hotelHotelID)
      this.newHotel = {}; // Clear the newHotel object

    },
    error: (error) => {
      console.error('Failed to add hotel:', error);
    }
  });
}
}
