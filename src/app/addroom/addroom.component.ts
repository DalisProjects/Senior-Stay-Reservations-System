import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';


import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { HotelDataService } from '../hotel-data.service';


@Component({
  selector: 'app-addroom',
  templateUrl: './addroom.component.html',
  styleUrls: ['./addroom.component.css']
})
export class AddroomComponent {
  hotels: any[] = [];
  selectedRoom: any = null; // Property to track the currently selected hotel for editing
  selectedFiles: File[] = [];
  existantFiles: File[] = [];
  maxuploaded: boolean = false;
  // Track uploaded image paths for each spot
  imagePreviews: string[] = [];
  formData = new FormData();
  errimg: boolean = false;
  roomAdded: boolean = false;
  hotel: any = null;

  constructor( private hotelDataService: HotelDataService, private router: Router, private http: HttpClient, public authService: AuthService, public nav:Router) {

   }


  
   ngOnInit() {
    this.hotelDataService.selectedHotel$.subscribe(hotel => {
      this.hotel = hotel; // Access hotel data from service
    });
    if(!this.hotel) {
      this.router.navigate([""]); 
      return
  }
    this.roomAdded = false;
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

  uploadImages(RoomID: number) { // Pass hotelId as a parameter
    for (let file of this.selectedFiles) {
      const now = new Date().toISOString().replace(/[éèêËÄâ§<>:"|?*\\'`{}.\[\]()/@#&%^$!+]/g, '-');
      const uniqueFilename = `RoomID-${RoomID}UserID-${this.authService.LoggedInUser.id}-${now}-${file.name}`;
        this.formData.append('images', file, uniqueFilename);
    }
    console.log(RoomID)
    // Pass hotelId as a parameter in the URL
    this.http.post(`http://localhost:3000/api/uploadtoroom/${RoomID}`, this.formData, { responseType: 'text' }).subscribe(
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


  AddRoom(reg: NgForm) {
    const RoomData = {
      HotelID: this.hotel.HotelID, 
      RoomType: reg.value.TypeS,
      MaxOccupancy: reg.value.Occupation, 
      Description: reg.value.DescriptionS,
      Price: reg.value.Prix,
    };
  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  const headers = { 'x-access-token': token || ''}; // Include token in headers

  this.http.post<any>('http://localhost:3000/api/hotel/room', RoomData, { headers })
  .subscribe({
    next: (data) => {
      console.log('Room added successfully !');
      this.uploadImages(data.RoomID)
      this.roomAdded = true;
    },
    error: (error) => {
      console.error('Failed to add hotel:', error);
    }
  });
}
}