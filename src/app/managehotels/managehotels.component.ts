import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';


import { NgForm } from '@angular/forms';
import { Observable, of ,forkJoin} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HotelDataService } from '../hotel-data.service';
import { Router, NavigationExtras } from '@angular/router';
@Component({
  selector: 'app-managehotels',
  templateUrl: './managehotels.component.html',
  styleUrls: ['./managehotels.component.css'] // Use styleUrls instead of styleUrl
})
export class ManagehotelsComponent implements OnInit {
  hotels: any[] = [];
  approvedHotels: any[] = [];
  unapprovedHotels: any[] = [];
  showAddHotelForm: boolean = false;
  editingHotel: boolean = false; // Property to track the currently selected hotel for editing
  selectedFile: File | null = null;
  users: any[] = []; // Array to store the list of users
  selectedUserId: number | null = null; // Variable to store the selected user ID
  uniqueFilename: any = {}
  imagePreviews: string[] = [];
  formData = new FormData();
  selectedFiles: File[] = [];
  existantFiles: File[] = [];
  selectedHotel: any = null;
  maxuploaded: boolean = false;

  // Track uploaded image paths for each spot
  errimg: boolean = false;
  roomlen: any = {} ;
  
  constructor(    private hotelDataService: HotelDataService, private http: HttpClient,  public authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.approvedHotels = this.hotels.filter(hotel => hotel.APPROVED);
    this.unapprovedHotels = this.hotels.filter(hotel => !hotel.APPROVED);
    this.fetchHotels();
    this.fetchUsers();
  }
  onHotelChange(selectedHotel: any): void {
    if (selectedHotel) {
      this.getUserFullName(selectedHotel.OwnerID);
      this.getAvailableRooms(selectedHotel);
    }
  }
  getAvailableRooms(hotel: any): void {
    // Implement logic to fetch available rooms based on hotelId
    this.http.get<any[]>(`http://localhost:3000/api/hotel/${hotel.HotelID}/rooms`)
      .subscribe({
        next: (data) => {
          this.roomlen[hotel.HotelID] = data.length; // Count number of rooms
        },
        error: (error) => {
          if (error.status === 404) {
            this.roomlen[hotel.HotelID] = 0; // Set room count to 0 if no rooms found
          } else {
            console.error('Failed to fetch rooms:', error);
          }
        }
      });
  }

  getUserFullName(userId: any): string {
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.lastname} ${user.username}` : '';
  }



  fetchUsers(): void {
    // Make an HTTP request to fetch the list of users
  
    this.http.get<any[]>('http://localhost:3000/api/users')
      .subscribe({
        next: (data) => {
          this.users = data; // Assign the retrieved list of users to the users array  
        },
        error: (error) => {
          console.error('Failed to fetch users:', error);
        }
      });
  }

  onSelectUser(userId: number): void {
    // Update the selectedUserId when a user is selected from the dropdown/select input field
    this.selectedUserId = userId;
  }

  checkUserExistence(): void {
    // Check if the selected user ID exists
    const userExists = this.users.some(user => user.id === this.selectedUserId);
  }
  fetchHotels(): void {
    this.http.get<any[]>('http://localhost:3000/api/hotel').subscribe({
      next: (data) => {
        this.hotels = data;
        this.approvedHotels = data.filter(hotel => hotel.APPROVED);
        this.unapprovedHotels = data.filter(hotel => !hotel.APPROVED);
 
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
  addHotel(reg: NgForm) {
    const HotelData = {
      OwnerID: reg.value.OwnerID,
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

    this.checkuser(reg.value.OwnerID).subscribe(userExists => {
      if (userExists) {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
  const headers = { 'x-access-token': token  || ''}; // Include token in headers
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

      console.log('Hotel added successfully:', data);
      this.toggleAddHotelForm(); // Hide the add hotel form
      this.uploadImages(data.hotelHotelID)
      this.fetchHotels(); // Refresh the list of hotels
      this.selectedFiles = [];
      this.existantFiles = [];
      this.maxuploaded = false;
      this.errimg = false;
      this.imagePreviews = [];

    },
    error: (error) => {
      console.error('Failed to add hotel:', error);
    }
       });
        // User exists
      } else {
        console.log("User does not exist")      }
    });
  
}
editHotel(hotel: any): void {
  console.log(this.selectedHotel)
  this.editingHotel = true;
}

cancelEdit(): void {
  this.editingHotel = false;
}

saveHotel(hotel: any): void {
  if (this.selectedHotel) {
    const updatedHotelData = {
      OwnerID: this.selectedUserId || hotel.OwnerID,
      HotelName: this.selectedHotel.HotelName || hotel.HotelName,
      HotelType: this.selectedHotel.HotelType || hotel.HotelType,
      Description: this.selectedHotel.Description || hotel.Description,
      AddressLine1: this.selectedHotel.AddressLine1 || hotel.AddressLine1,
      AddressLine2: this.selectedHotel.AddressLine2 || hotel.AddressLine2,
      City: this.selectedHotel.City || hotel.City,
      APPROVED: this.selectedHotel.APPROVED || hotel.APPROVED,
      PostalCode: this.selectedHotel.PostalCode || hotel.PostalCode,
      Country: this.selectedHotel.Country || hotel.Country,
      PhoneNumber: this.selectedHotel.PhoneNumber || hotel.PhoneNumber,
      Website: this.selectedHotel.Website || hotel.Website,
      Email: this.selectedHotel.Email || hotel.Email,
      StarRating: parseFloat(this.selectedHotel.StarRating || hotel.StarRating),
      localisation: this.selectedHotel.localisation || hotel.localisation,
    };
    this.getUserFullName(this.selectedHotel.OwnerID);
    this.checkuser(Number(updatedHotelData.OwnerID)).subscribe(userExists => {
      if (userExists) {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        const headers = { 'x-access-token': token  || ''}; // Include token in headers
        this.http.put<any>('http://localhost:3000/api/hotel/' + hotel.HotelID, updatedHotelData, { headers })
        .subscribe({
          next: (data) => {
            console.log('Hotel updated successfully !');
            this.fetchHotels(); // Refresh the list of hotels
            this.selectedHotel = null; // Reset selected hotel
            this.editingHotel = false;
          },
          error: (error) => {
            console.error('Failed to update hotel:', error);
          }
        });
            } else {
          console.log("User does not exist")
            }
    });
    
  }
 }
 checkuser(id: number): Observable<boolean> {
  return this.http.get<any>(`http://localhost:3000/api/users/id/${id}`)
    .pipe(
      map(() => true), // If request succeeds, user exists
      catchError(error => {
        if (error.status === 404) {
          return of(false); // User does not exist
        } else {
          console.error('Error checking user existence:', error);
          return of(false); // Error occurred, user does not exist
        }
      })
    );
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
