import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';




@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentialsvalid: boolean = true;
  returnUrl: any = []


  constructor(public authService: AuthService,
    private route: ActivatedRoute,  private http: HttpClient, private router: Router) { }
  ngOnInit(){
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';
      // Navigate to the returnUrl after successful login or registration
      console.log(this.returnUrl)
  });
  }
  RegisterButton(){
    this.router.navigate(['/register'], { queryParams: { returnUrl: this.returnUrl } });
  }
  doLogin(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;
    // Make a request to check if the email exists
    this.http.get<any>('http://localhost:3000/api/users/' + email)
    .subscribe({
        next: (data) => {
          if (data) {
            // Check if the password matches
            if (data.password === password) {
              //logs in
              this.authService.LoggedInUser.email = email;
              this.authService.login(data.email, data.password);
              this.router.navigateByUrl(this.returnUrl);

            } else {
              this.credentialsvalid = false;
            }
          } else {
            // Email does not exist
            this.credentialsvalid = false;
          }
        },
        error: (error) => {
          console.error('Failed to check user:', error);
          this.credentialsvalid = false;       }
      });
  }
}
