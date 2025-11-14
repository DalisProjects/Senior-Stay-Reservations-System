import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';



@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css']
})
export class ContactusComponent {
  username: string = '';
  email: string = '';
  phone: string = '';
  subject: string = '';
  message: string = '';
  emailInvalid: boolean = false;
  emailsent: boolean= false;
  reqhtml: string = '';

  constructor(private http: HttpClient,  public authService: AuthService,) { }
validateEmail(email: string): boolean {
    // Regular expression to check email format
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }
  onSubmit(): void {
    if (!this.validateEmail(this.email)) {
      this.emailInvalid = true;
      return;
    }
    const subjectsent = this.subject || '';
    const subjectphone = this.phone || '';
      if(this.authService.isLoggedIn){
        if(this.authService.LoggedInUser.type=="Client"){
        this.reqhtml= `<html>
        <p><strong> Nom d'utilisateur:</strong>  ${this.username}</p><br>
        <p><strong>Numéro de téléphone: </strong> ${subjectphone}</p> <br>  
        <p><strong>Message:</strong>  ${this.message}</p><br>
         <br><br><br>
         <span style="font-size: 10px; background-color: #f0f0f0;">
         <strong>INFORMATIONS D'UTILISATEUR:</strong> <br>
         ID: ${this.authService.LoggedInUser.id}<br>
         NOM: ${this.authService.LoggedInUser.name}<br>
         prenom: ${this.authService.LoggedInUser.lastname}<br>
         E-MAIL: ${this.authService.LoggedInUser.email}<br>
         TÉLÉPHONE: ${this.authService.LoggedInUser.phone}<br>
         NATIONALITÉ: ${this.authService.LoggedInUser.nationality}<br>
         </span></html>`;
        }
        if(this.authService.LoggedInUser.type=="Partenaire"){
          this.reqhtml= `<html>
          <p><strong> Nom d'utilisateur:</strong>  ${this.username}</p><br>
          <p><strong>Numéro de téléphone: </strong> ${subjectphone}</p> <br>  
          <p><strong>Message:</strong>  ${this.message}</p><br>
           <br><br><br>
           <span style="font-size: 10px; background-color: #f0f0f0;">
           <strong>INFORMATIONS D'UTILISATEUR:</strong> <br>
           ID: ${this.authService.LoggedInUser.id}<br>
           NOM D'Organization: ${this.authService.LoggedInUser.lastname}<br>
           E-MAIL: ${this.authService.LoggedInUser.email}<br>
           SERIAL NUMBER: ${this.authService.LoggedInUser.serialnumber}<br>
           TÉLÉPHONE: ${this.authService.LoggedInUser.phone}<br>
           PAYS: ${this.authService.LoggedInUser.pays}<br>
           VILLE: ${this.authService.LoggedInUser.ville}<br>
           </span></html>`;
          }
      }
      else {
        this.reqhtml= `<html>
        <p><strong> Nom d'utilisateur:</strong>  ${this.username}</p><br>
        <p><strong>Numéro de téléphone: </strong> ${subjectphone}</p> <br>  
        <p><strong>Message:</strong>  ${this.message}</p><br>
         <br><br><br>
         <span style="font-size: 15px; background-color: #f0f0f0;">
         <strong>Utilisateur non connecté</strong> <br>
         </span></html>`;
      }

      
       const emailad = "ospisbooking@gmail.com"
       const subject = `Demande de l'utilisateur: ${subjectsent}`
       this.emailsent = true;
       this.authService.SendEmail(emailad, subject, this.reqhtml);   
  }
}
