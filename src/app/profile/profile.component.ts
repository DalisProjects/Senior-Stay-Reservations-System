import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';


import { countries } from 'src/assets/countries';
 // Import the list of countries
import { countryCodes } from 'src/assets/countries';
import { Router } from '@angular/router';



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
     clickeddelete: boolean= false;
     editedField: string = '';
     editMode: string= 'none';
     editedUser = {
     name: '',
     lastname: '',
     dateofbirth: new Date('01/01/1940'),
     gender: '',
     nationality: '',
     phone: '',
     pays: '',
     ville: '',
     adresse: '',
     codepostal: '',
     email: '',
     password: '',
     serialnumber: '',
  }
     countriesList: string[] = countries; // Assign the list of countries to a variable
     countryCodesList = countryCodes;



  constructor( public authService: AuthService, private http: HttpClient, private router: Router) {
    this.editedField = '';

   }

  ngOnInit(): void {

  }
 
  changeclicked(){
    this.clickeddelete = !this.clickeddelete
  }
  edit(field: string) {
    this.editedField = field;
    // Initialize edited field value with existing value
    if (field === 'lastname') {
      this.editMode = field;
      this.editedUser.lastname = this.authService.LoggedInUser.lastname;
    }
    if (field === 'name') {
      this.editMode = field;
      this.editedUser.name = this.authService.LoggedInUser.name;
    }
    if (field === 'birth') {
      this.editMode = field;
      this.editedUser.dateofbirth = this.authService.LoggedInUser.dateofbirth;
    }
    if (field === 'gender') {
      this.editMode = field;
      this.editedUser.gender = this.authService.LoggedInUser.gender;
    }
    if (field === 'nationality') {
      this.editMode = field;
      this.editedUser.nationality = this.authService.LoggedInUser.nationality;
    }
    if (field === 'phone') {
      this.editMode = field;
      this.editedUser.phone = this.authService.LoggedInUser.phone;
    }
    if (field === 'adresse') {
      this.editMode = field;
      this.editedUser.adresse = this.authService.LoggedInUser.adresse;
    }
    if (field === 'pays') {
      this.editMode = field;
      this.editedUser.pays = this.authService.LoggedInUser.pays;
    }
    if (field === 'ville') {
      this.editMode = field;
      this.editedUser.ville = this.authService.LoggedInUser.ville;
    }
    if (field === 'codepostal') {
      this.editMode = field;
      this.editedUser.codepostal = this.authService.LoggedInUser.codepostal;
    }
    if (field === 'email') {
      this.editMode = field;
      this.editedUser.email = this.authService.LoggedInUser.email;
    }
    if (field === 'password') {
      this.editMode = field;
      this.editedUser.password = this.authService.LoggedInUser.password;
    }
    if (field === 'serialnumber') {
      this.editMode = field;
      this.editedUser.serialnumber = this.authService.LoggedInUser.serialnumber;
    }
    // Add similar logic for other fields
  }

  apply(field: string) {
    // Update the database with the new value
    if (field === 'name') {
      let name = this.editedUser.name || this.authService.LoggedInUser.name; // Default date of birth if skipped
      this.http.put('http://localhost:3000/api/users/' + this.authService.LoggedInUser.id, { username: name })
        .subscribe(response => {
          // Handle response
          this.authService.LoggedInUser.name = name;
          localStorage.setItem('userdataname', name);
          console.log('Name updated successfully');
          // Exit edit mode
          this.editMode = 'none';
        });
    }
    if (field === 'lastname') {
      let lastname = this.editedUser.lastname || this.authService.LoggedInUser.lastname; // Default date of birth if skipped
      this.http.put('http://localhost:3000/api/users/' + this.authService.LoggedInUser.id, { lastname: lastname })
        .subscribe(response => {
          // Handle response
          this.authService.LoggedInUser.lastname = lastname;
          localStorage.setItem('userdatalastname', lastname);
          console.log('Last name updated successfully');
          // Exit edit mode
          this.editMode = 'none';
        });
    }
    if (field === 'birth') {
      const birthday = new Date(this.editedUser.dateofbirth) || new Date(this.authService.LoggedInUser.dateofbirth) // Default date of birth if skipped
      this.http.put('http://localhost:3000/api/users/' + this.authService.LoggedInUser.id, { dateOfBirth: birthday })
        .subscribe(response => {
          // Handle response
          this.authService.LoggedInUser.dateofbirth = birthday;
          localStorage.setItem('userdatadateOfBirth', birthday.toISOString());
          console.log('Birth updated successfully');
          // Exit edit mode
          this.editMode = 'none';
        });
    }
    if (field === 'gender') {
      let gender = this.editedUser.gender || this.authService.LoggedInUser.gender; // Default date of birth if skipped
      this.http.put('http://localhost:3000/api/users/' + this.authService.LoggedInUser.id, { gender: gender })
        .subscribe(response => {
          // Handle response
          this.authService.LoggedInUser.gender = gender;
          localStorage.setItem('userdatagender', gender);
          console.log('Gender updated successfully');
          // Exit edit mode
          this.editMode = 'none';
        });
    }
    if (field === 'nationality') {
      let Nationality = this.editedUser.nationality || this.authService.LoggedInUser.nationality; // Default date of birth if skipped
      this.http.put('http://localhost:3000/api/users/' + this.authService.LoggedInUser.id, { Nationality: Nationality })
        .subscribe(response => {
          // Handle response
          this.authService.LoggedInUser.nationality = Nationality;
          localStorage.setItem('userdataNationality', Nationality);
          console.log('Nationality updated successfully');
          // Exit edit mode
          this.editMode = 'none';
        });
    }
    if (field === 'phone') {
      let phone = this.editedUser.phone || this.authService.LoggedInUser.phone; // Default date of birth if skipped
      this.http.put('http://localhost:3000/api/users/' + this.authService.LoggedInUser.id, { phnumber: phone })
        .subscribe(response => {
          // Handle response
          this.authService.LoggedInUser.phone = phone;
          localStorage.setItem('userdataphnumber', phone);
          console.log('Phone updated successfully');
          // Exit edit mode
          this.editMode = 'none';
        });
    }
    if (field === 'pays') {
      let Pays = this.editedUser.pays || this.authService.LoggedInUser.pays;// Default date of birth if skipped
      this.http.put('http://localhost:3000/api/users/' + this.authService.LoggedInUser.id, { pays: Pays })
        .subscribe(response => {
          // Handle response
          this.authService.LoggedInUser.pays = Pays;
          localStorage.setItem('userdatapays', Pays);
          console.log('Pays updated successfully');
          // Exit edit mode
          this.editMode = 'none';
        });
    }
    if (field === 'ville') {
      let Ville = this.editedUser.ville || this.authService.LoggedInUser.ville;// Default date of birth if skipped
      this.http.put('http://localhost:3000/api/users/' + this.authService.LoggedInUser.id, { ville: Ville })
        .subscribe(response => {
          // Handle response
          this.authService.LoggedInUser.ville = Ville;
          localStorage.setItem('userdataville', Ville);
          console.log('Ville updated successfully');
          // Exit edit mode
          this.editMode = 'none';
        });
    }
    if (field === 'adresse') {
      let adresse = this.editedUser.adresse || this.authService.LoggedInUser.adresse;// Default date of birth if skipped
      this.http.put('http://localhost:3000/api/users/' + this.authService.LoggedInUser.id, { adresse: adresse })
        .subscribe(response => {
          // Handle response
          this.authService.LoggedInUser.adresse = adresse;
          localStorage.setItem('userdataadresse', adresse);
          console.log('adresse updated successfully');
          // Exit edit mode
          this.editMode = 'none';
        });
    }
    if (field === 'codepostal') {
      let codepostal = this.editedUser.codepostal || this.authService.LoggedInUser.codepostal;// Default date of birth if skipped
      this.http.put('http://localhost:3000/api/users/' + this.authService.LoggedInUser.id, { adresse: codepostal })
        .subscribe(response => {
          // Handle response
          this.authService.LoggedInUser.codepostal = codepostal;
          localStorage.setItem('userdatacodepostal', codepostal);
          console.log('codepostal updated successfully');
          // Exit edit mode
          this.editMode = 'none';
        });
    }
    if (field === 'serialnumber') {
      let serialnumber = this.editedUser.serialnumber || this.authService.LoggedInUser.serialnumber;// Default date of birth if skipped
      this.http.put('http://localhost:3000/api/users/' + this.authService.LoggedInUser.id, { serialnumber: serialnumber })
        .subscribe(response => {
          // Handle response
          this.authService.LoggedInUser.serialnumber = serialnumber;
          localStorage.setItem('userdataserialnumber', serialnumber);
          console.log('Serial Number updated successfully');
          // Exit edit mode
          this.editMode = 'none';
        });
    }
}
closePopup(): void {
  this.authService.deletionerror = false;
  this.clickeddelete = false;
}



  cancel() {
    // Reset edit mode
    this.editMode = 'none';
  }
  DeleteAccount() {
    this.authService.DeleteAccount(this.authService.LoggedInUser.id);
  }
  
    }