import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';



@Component({
  selector: 'app-userslist',
  templateUrl: './userslist.component.html',
  styleUrls: ['./userslist.component.css']
})
export class UsersListComponent implements OnInit {
  users: any[] = [];
  newDATA : any = {};
  userclient: number = 0;
  userpartner: number = 0;
  clickeddelete: boolean=false;
  editedUserData: any = {}; // Track the edited user data
  isEditing: boolean = false; // Flag to indicate if a user is being edited
  deletionerror: boolean =false;
  UserID: number = 0;
  constructor(private http: HttpClient,  public authService: AuthService,) { }

  ngOnInit(): void {
    this.getUsers();
  }
  DeleteAccount(id: number) {
    this.http.delete(`http://localhost:3000/api/users/${id}`)
    .subscribe(
      () => {
        this.deletionerror = false;

       },
      (error) => {
         this.deletionerror = true;
         console.error('Failed to delete user:', error);
      }
    );
}
RejectAccount(user: any) {
  const reqhtml= ` 
      <html><p>Nous vous remercions d'avoir choisi SILVER Booking.</p>
      <p>Malheureusement votre demande a été rejeter, ne hésitez pas de nous contactez si vous avez des questions !<p>
      <p>Merci et bonne journée!</p>
    </html>`;
  this.authService.SendEmail(user.email, "Compte Rejeté", reqhtml);
  this.http.delete(`http://localhost:3000/api/users/${user.id}`)
  .subscribe(
    () => {
      this.deletionerror = false;
      
      this.getUsers();
     },
    (error) => {
       this.deletionerror = true;
       console.error('Failed to delete user:', error);
    }
  );
}
ApproveUser(user: any) {
  this.http.put<any>('http://localhost:3000/api/users/' + user.id,
  { username: 'Verified'})
  .subscribe({
    next: (data) => {
      // Handle success response
      console.log('User verified successfully:');
      const reqhtml= ` 
      <html><p>Nous vous remercions d'avoir choisi SILVER Booking.</p>
      <p>Votre compte a été vérifé avec success, ne hésitez pas de nous contactez si vous avez des questions !<p>
      <p>Veuillez reconnectez s'il vous plaît</p>
    </html>`;
      this.authService.SendEmail(user.email, "Compte Verifié", reqhtml);   
         this.getUsers();

      // Reset isEditing flag
    },
    error: (error) => {
      // Handle error response
      console.error('Failed to update user:', error);
      // Optionally, display an error message to the user
    }
  });
}
  getUsers() {
    this.http.get<any[]>('http://localhost:3000/api/users').subscribe(
      (data) => {
        this.users = data;
        this.userclient = data.filter(data => data.type === "Client").length  || 0;
        this.userpartner = data.filter(data => data.type === "Partenaire").length || 0;
      },
      (error) => {
        console.error('Failed to retrieve users:', error);
      }
    );
  }
  changeclicked(){
  
     this.clickeddelete = !this.clickeddelete
  }
  closePopup(): void {
    this.deletionerror = false;
    this.clickeddelete = false;
  }
  editUser(user: any) {
    // Set the user being edited
    // Initialize editedUserData with user's current data
    this.editedUserData = user;
    // Set isEditing flag to true
    this.isEditing = true;
  }

  cancelEdit(user: any) {
    // Clear editedUserData
    this.editedUserData = {};
    // Reset isEditing flag
    this.isEditing = false;
  }

  updateUser(user: any) {

      
    if(user.type== 'Partenaire'){
      this.newDATA= {};
      this.newDATA = {
      username: this.editedUserData.username || user.username,
      lastname: this.editedUserData.lastname || user.lastname,
      email: this.editedUserData.email || user.email,
      phnumber: this.editedUserData.phnumber|| user.phnumber,
      IsAdmin: this.editedUserData.IsAdmin || user.IsAdmin,
      password: this.editedUserData.password || user.password,
      pays: this.editedUserData.pays || user.pays,
      ville: this.editedUserData.ville || user.ville,
      codepostal: this.editedUserData.codepostal || user.codepostal,
      adresse: this.editedUserData.adresse || user.adresse,
      serialnumber: this.editedUserData.serialnumber || user.serialnumber,
    }
    }
    else{
      this.newDATA= {};
      this.newDATA = {
      username: this.editedUserData.username || user.username,
      lastname: this.editedUserData.lastname || user.lastname,
      email: this.editedUserData.email || user.email,
      gender: this.editedUserData.gender || user.gender,
      phnumber: this.editedUserData.phnumber|| user.phnumber,
      dateOfBirth: this.editedUserData.dateOfBirth || new Date(user.dateOfBirth),
      Nationality: this.editedUserData.Nationality || user.Nationality,
      IsAdmin: this.editedUserData.IsAdmin || user.IsAdmin,
      password: this.editedUserData.password || user.password,
      pays: this.editedUserData.pays || user.pays,
      ville: this.editedUserData.ville || user.ville,
      codepostal: this.editedUserData.codepostal || user.codepostal,
      adresse: this.editedUserData.adresse || user.adresse,
    }
    }
    // Send a PUT request to update the user's data on the server
    this.http.put<any>('http://localhost:3000/api/users/' + user.id,  this.newDATA)
    .subscribe({
      next: (data) => {
        // Handle success response
        console.log('User updated successfully !');
        // Update the user list to reflect the changes
        this.getUsers();
        // Clear editedUserData
        this.editedUserData = {};
        // Reset isEditing flag
        this.isEditing = false;
      },
      error: (error) => {
        // Handle error response
        console.error('Failed to update user:', error);
        // Optionally, display an error message to the user
      }
    });
  }


}
