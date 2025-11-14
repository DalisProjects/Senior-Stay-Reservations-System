import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';




@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent {
  constructor( public authService: AuthService, private http: HttpClient, ) { }

  email: string = ''; // Property to bind to the email input field
UserExists: boolean = true;
verificationCode: string = '';
showVerificationCodeInput: boolean = false;
verificationAttempted: boolean = false; // Flag to track if verification has been attempted
verificationSuccess: boolean = false; // Flag to track if verification was successful
verificationInput: string = ''; // Input field for verification code
verifiedemail: string = '';
EmailNotVerified: boolean = false;
passcode: string = '';
confirmPasscode: string = '';
canSendEmail: boolean = true;
endTime: number = 0;

ngOnInit(): void {
  this.endTime = Date.now() + 59000; // 59000 milliseconds = 59 seconds
  
}

generateVerificationCode(): string {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min + '';
}

SendConfirmationEmail() {
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

  this.http.get<any>(`http://localhost:3000/api/users/${this.email}`)
  .subscribe({
    next: () => {
      this.verificationCode = this.generateVerificationCode();
  // Send confirmation email
  const reqhtml = `<p>Votre code de réinitialisation est:</p>
  <br><br><p> <span style="font-size: 22px; background-color: #f0f0f0; padding: 5px;">${this.verificationCode}</span></p>
  <p>Merci d'avoir utilisé nos services</p>`
  this.authService.SendEmail(this.email, "Réinitialisation de mot de passe", reqhtml);   
  console.log('Email sent successfully');
  this.showVerificationCodeInput = true;
  this.UserExists = true;
    },
    error: (error) => {
      // User does not exist, proceed with sending confirmation email
      if (error.status === 404) {
        this.UserExists = false;
      } else {
        console.error('Error checking user existence:', error);
        this.UserExists = false;

      }
    }
  }); 
}
verifyCode() {
  if (this.verificationInput === this.verificationCode && this.UserExists) {
    this.verificationSuccess = true;
    this.showVerificationCodeInput = false;
    this.verifiedemail = this.email;

  } else {
    this.verificationSuccess = false;
  }
  this.verificationAttempted = true;
}
get countdownMessage(): string {
  if (!this.canSendEmail) {
    const secondsRemaining = Math.ceil((this.endTime - Date.now()) / 1000);
    return `Veuillez attendre ${secondsRemaining} secondes pour envoyer un autre code.`;
  }
  return '';
}
fp(reg: NgForm){
  this.http.put('http://localhost:3000/api/users/email/' + reg.value.email, {password: reg.value.passcode})
  .subscribe({
    next: (data) => {
      console.log('Password updated successfully');
      this.authService.login(reg.value.email, reg.value.passcode) 
    },
    error: (error) => {
      console.error('Failed to update password:', error);
    }
  });

}
}
