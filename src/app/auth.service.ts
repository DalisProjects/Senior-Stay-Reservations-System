import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public deletionerror: boolean = false;
  
  public LoggedInUser = {
    email: '',
    name: '',
    lastname: '',
    id: 0,
    gender: '',
    dateofbirth: new Date('1940-01-01'),
    phone: '',
    nationality: '',
    type: '',
    password: '',
    passwordlength: '',
    adresse: '',
    ville: '',
    pays: '',
    codepostal: '',
    serialnumber: '',
  };
  emptydata = {
    email: '',
    name: '',
    lastname: '',
    id: 0,
    gender:' ',
    dateofbirth: new Date('1940-01-01'),
    phone: '',
    nationality:'',
    type: '',
    password: '',
    passwordlength: '',
    adresse: '',
    ville: '',
    pays: '',
    codepostal: '',
    serialnumber: '',
  }; 
  public IsAdmin: boolean = false;
  isLoggedIn: boolean = false;

  constructor(private http: HttpClient, private router: Router) {
    this.retrieveUserData()
    // Check if token exists on application load
    const token = localStorage.getItem('token');
    if (token) {
      // Send token to server for verification
      this.verifyToken(token);
    }
  }
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token') || '', // Include token in the headers
    })};

  private verifyToken(token: string): void {
    // Send token to server for verification
    this.http.post<any>('http://localhost:3000/api/verifyToken', {}, this.httpOptions) // Pass httpOptions
      .subscribe({
        next: (data) => {
          // Token is valid, update authentication state
          this.isLoggedIn = true;
          this.retrieveUserData();
        },
        error: (error) => {
          console.error('Failed to verify token:', error);
          // Token verification failed, remove token and log out user
          this.logout();
        }
      });
  }  

  public retrieveUserData(): void {
    // Retrieve user data from localStorage
    const isLoggedInString = localStorage.getItem('userisLoggedIn');
    if (!isLoggedInString) {
      this.isLoggedIn = false;
      localStorage.setItem('userisLoggedIn', JSON.stringify(false));
  }
    // Retrieve other user data only if the user is logged in
    if (isLoggedInString) {
    // Retrieve user data from localStorage
    this.isLoggedIn = JSON.parse(isLoggedInString);
    this.LoggedInUser.name = localStorage.getItem('userdataname') || '';
    this.LoggedInUser.passwordlength = localStorage.getItem("passwordlength") || '';
    this.LoggedInUser.lastname = localStorage.getItem('userdatalastname') || '';
    this.LoggedInUser.id = Number(localStorage.getItem('userdataid'))
    this.LoggedInUser.gender = localStorage.getItem('userdatagender') || '';
    this.LoggedInUser.nationality = localStorage.getItem('userdataNationality') || '';
    this.LoggedInUser.dateofbirth = new Date(localStorage.getItem('userdatadateOfBirth') || '');
    this.LoggedInUser.phone = localStorage.getItem('userdataphnumber') || '';
    this.LoggedInUser.password = localStorage.getItem('userdatapassword') || '';
    this.LoggedInUser.email = localStorage.getItem('userdataemail') || '';
    this.LoggedInUser.ville = localStorage.getItem('userdataville') || '';
    this.LoggedInUser.pays = localStorage.getItem('userdatapays') || '';
    this.LoggedInUser.codepostal = localStorage.getItem('userdatacodepostal') || '';
    this.LoggedInUser.adresse = localStorage.getItem('userdataadresse') || '';
    this.LoggedInUser.type = localStorage.getItem('userdatatype') || '';
    this.LoggedInUser.serialnumber = localStorage.getItem('userdataserialnumber') || '';
    const isAdminString = localStorage.getItem('userdataIsAdmin');
    if (!isAdminString) {
      this.IsAdmin = false;
      localStorage.setItem('userdataIsAdmin', JSON.stringify(false));
     }
    if(isAdminString){
    this.IsAdmin = JSON.parse(isAdminString);
    }
    }
  }
  
  login(email: string, password: string) {
    this.http.post<any>('http://localhost:3000/api/login', { email, password })
      .subscribe({
        next: (data) => {
          this.LoggedInUser= {
            email: email,
            name: data.user.username,
            lastname: data.user.lastname,
            id: data.user.id,
            gender: data.user.gender,
            dateofbirth: data.user.dateOfBirth,
            phone: data.user.phnumber,
            nationality: data.user.Nationality,
            type: data.user.type,
            password: data.user.password,
            passwordlength: data.user.passwordlength,
            adresse: data.user.adresse,
            ville: data.user.ville,
            pays: data.user.pays,
            codepostal: data.user.codepostal,
            serialnumber: data.user.serialnumber,
          };
          this.log("User Registered woth email: "+email, data.user.id, (data.user.name, data.user.lastname))
          if (data.user.IsAdmin) { this.IsAdmin = true; }
          this.isLoggedIn = true;
          const Le = this.LoggedInUser.password.length;
          this.LoggedInUser.passwordlength = '*'.repeat(Le);
          localStorage.setItem('passwordlength', this.LoggedInUser.passwordlength);
          localStorage.setItem('token', data.token);
          localStorage.setItem('userdataname', data.user.username);
          localStorage.setItem('userdatalastname', data.user.lastname);
          localStorage.setItem('userdataid', data.user.id);
          localStorage.setItem('userdatagender', data.user.gender);
          localStorage.setItem('userdataNationality', data.user.Nationality);
          localStorage.setItem('userdatadateOfBirth', data.user.dateOfBirth);
          localStorage.setItem('userdataphnumber', data.user.phnumber);
          localStorage.setItem('userdatapassword', password); // Store password securely if needed
          localStorage.setItem('userdataemail', email); // Store email if needed
          localStorage.setItem('userdatatype', data.user.type); // Store email if needed
          localStorage.setItem('userdataadresse', data.user.adresse); // Store email if needed
          localStorage.setItem('userdataville', data.user.ville); // Store email if needed
          localStorage.setItem('userdatapays', data.user.pays); // Store email if needed
          localStorage.setItem('userdatacodepostal', data.user.codepostal); // Store email if needed
          localStorage.setItem('userdataserialnumber', data.user.serialnumber); // Store serialnum if needed
          localStorage.setItem('userisLoggedIn', JSON.stringify(this.isLoggedIn));
          localStorage.setItem('userdataIsAdmin', JSON.stringify(this.IsAdmin));

        },
        error: (error) => {
          console.error('Failed to login:', error);
        }
      });
  }


  logout() {
    if(this.isLoggedIn){
    this.log("Utilisateur déconnecter", this.LoggedInUser.id, (this.LoggedInUser.name, this.LoggedInUser.lastname))
    }
    // Perform logout operations
    this.isLoggedIn = false;
    this.IsAdmin = false;
    localStorage.clear();
    this.LoggedInUser = this.emptydata;
    // Redirect the user to the login page or wherever you want
    this.router.navigateByUrl('/login');
  }
  
   DeleteAccount(id: number) {
    this.log("Compte Supprimé", id, "Data Unavailable")

      this.http.delete(`http://localhost:3000/api/users/${id}`)
      .subscribe(
        () => {
          this.router.navigate(["/login"]); // Redirect to home page if not logged in
          this.isLoggedIn = false;
          this.IsAdmin = false;
          localStorage.clear();
          this.LoggedInUser = this.emptydata;  
          this.deletionerror = false;

         },
        (error) => {
           this.deletionerror = true;
           console.error('Failed to delete user:', error);
        }
      );
  }
  SendEmail(To: string, subject: string, content: string) {

    // Send confirmation email
    this.http.post<any>('http://localhost:3000/send-email', { email: To , subject: subject, html: content})
      .subscribe({ });
      this.log("Email Envoyéé to: "+To, 0, ("Sujet"+subject+"Contenue: "+content))
}
logs: { message: string; timestamp: string; senderid: number; sender: string }[] = [];

  log(message: string, senderid: number, sender: string): void {
    const timestamp = new Date().toLocaleString();
    this.logs.unshift({ message, timestamp, senderid, sender });
    // You can also send this log to your backend or any other service here
  }

}