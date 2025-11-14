import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { countries } from 'src/assets/countries';
import { countryCodes } from 'src/assets/countries';
import { AuthService } from '../auth.service';




@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  emailError: boolean = false;
  PasswordError: boolean = false;
  EmailUsed: boolean = false;
  confirmPassword: string = ''; // Add confirmPassword property
  email: string = ''; // Property to bind to the email input field
  countriesList: string[] = countries; // Assign the list of countries to a variable
  countryCodesList = countryCodes;
  verificationCode: string = '';
  showVerificationCodeInput: boolean = false;
  verificationAttempted: boolean = false; // Flag to track if verification has been attempted
  verificationSuccess: boolean = false; // Flag to track if verification was successful
  verificationInput: string = ''; // Input field for verification code
  sub: string = '';
  reqhtml: string = '';
  canSendEmail: boolean = true;
  endTime: number = 0;
  type: string ='';
  returnUrl: any = [];


  constructor(public authService:AuthService, private route: ActivatedRoute,  private http: HttpClient, private router: Router) { }


  ngOnInit(): void {
    this.endTime = Date.now() + 59000; // 59000 milliseconds = 59 seconds
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';
      // Navigate to the returnUrl after successful login or registration
      console.log(this.returnUrl)
  });
  }
 


  validateEmail(email: string): boolean {
    // Regular expression to check email format
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }
  verifyCode() {
   
    if (this.verificationInput === this.verificationCode && !this.emailError) {
      this.verificationSuccess = true;
      this.showVerificationCodeInput = false;
    } else {
      this.verificationSuccess = false;
    }
    this.verificationAttempted = true;
  }

  generateVerificationCode(): string {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min + '';
  }
  loginagain(){
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl || '/' } });
  }
  sendConfirmationEmail() {
    if (!this.validateEmail(this.email)) {
      this.emailError = true;
      this.EmailUsed = false;
      return;
    }
   
    this.http.get<any>(`http://localhost:3000/api/users/${this.email}`)
    .subscribe({
      next: () => {
        // User already exists
        this.EmailUsed = true;
        this.emailError = false;
      },
    error: (error) => {
      // User does not exist, proceed with sending confirmation email
      if (error.status === 404) {
        this.createAndSendConfirmationEmail();
      } else {
        console.error('Error checking user existence:', error);
        // Handle other errors here if needed
        this.EmailUsed = true;
        this.emailError = false;
      }
    }
  });
 
  
}


passwordValidator(password: string): boolean {
  const minLength = 8; // Minimum length requirement
  const hasNumber = /\d/.test(password); // Check for at least one number
  const hasUppercase = /[A-Z]/.test(password); // Check for at least one uppercase letter
  const hasLowercase = /[a-z]/.test(password); // Check for at least one lowercase letter

  return (
      password.length >= minLength &&
      hasNumber &&
      hasUppercase &&
      hasLowercase);
}

createAndSendConfirmationEmail() {
  if (!this.canSendEmail) {
    return;
  }
  // Set a timeout of 59 seconds
  this.endTime = Date.now() + 59000;
  this.canSendEmail = false;
  setTimeout(() => {
    this.canSendEmail = true;
    this.endTime = Date.now() + 59000;
  }, 59000);

  this.verificationCode = this.generateVerificationCode();
  const sub = "Verification du compte SILVER BOOKING: ";
  console.log(this.verificationCode)
  const reqhtml= ` 
  <html><p>Nous vous remercions d'avoir choisi SILVER Booking.</p>
  <p>Veuillez copier ce code:<br><br> <span style="font-size: 22px; background-color: #f0f0f0; padding: 5px;">${this.verificationCode}</span></p>
  <p>Merci et bonne journée!</p>
</html>`;
 this.authService.SendEmail(this.email, sub, reqhtml)
        this.showVerificationCodeInput = true;
        this.emailError = false;
        this.EmailUsed = false;
}

get countdownMessage(): string {
  if (!this.canSendEmail) {
    const secondsRemaining = Math.ceil((this.endTime - Date.now()) / 1000);
    return `Veuillez attendre ${secondsRemaining} secondes pour envoyer un autre code.`;
  }
  return '';
}

  register(reg: NgForm) {
    
    const newUser = {
      username: reg.value.username || '',
      lastname: reg.value.lastname,
      email: this.email,
      password: reg.value.password,
      gender: reg.value.gender || '',
      dateOfBirth: reg.value.dateOfBirth || '1940-01-01', // Use date of birth
      phnumber: reg.value.phnumber || '',
      Nationality: reg.value.Nationality || '',
      type: reg.value.type,
      pays: reg.value.pays || '',
      adresse: reg.value.adresse || '',
      ville: reg.value.ville || '',
      codepostal: reg.value.codepostal || '',
      serialnumber:  reg.value.serialnumber || '',
    };
    if (!this.passwordValidator(reg.value.password)) {
      this.PasswordError = true;
      return;
    }
    else{this.PasswordError = false;}
    
  if (!this.validateEmail(this.email)) {
    this.emailError = true;
    return;
  }
  else{this.emailError = false;}



   this.http.post<any>('http://localhost:3000/api/users', newUser)
   .subscribe({
     next: (data) => {
       console.log('User registered successfully !');
       this.authService.LoggedInUser.email = this.email;
       reg.resetForm(); // Reset the form
       this.authService.login(newUser.email, newUser.password);
       this.router.navigateByUrl(this.returnUrl);
       if(data.type === 'Client'){
        this.sub = "Account registered successfully";
        this.reqhtml= ` 
       <html><p>Nous vous remercions d'avoir choisi SILVER Booking.</p>
       <p>Votre compte a été créer avec success, si vous avez des questions ne hésitez pas de nous-contactez !</p>
       <p>Merci et bonne journée!</p>
     </html>`;
      }
      else {        
       this.sub = "Professional account registered successfully and awaiting for administrative approval";
       this.reqhtml= ` 
       <html><p>Nous vous remercions d'avoir choisi SILVER Booking.</p>
       <p>Votre compte a été créer avec success, waiting for admins to approve your account</p>
       <p>Merci et bonne journée!</p>
     </html>`; }

      this.authService.SendEmail(this.email, this.sub, this.reqhtml)
      this.showVerificationCodeInput = true;
      this.emailError = false;
      this.EmailUsed = false;
     },
     error: (error) => {
       console.error('Failed to register user:', error);
       if (error.error && error.error.error === 'Email already in use') {
         // Set emailError to true to display the alert in the template
         this.emailError = true;
       } else {
       }
     }
   });
  }

}
