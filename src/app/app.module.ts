import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';


import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { LandingComponent } from './landing/landing.component';
import { AboutComponent } from './about/about.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { UsersListComponent } from './userslist/userslist.component';
import { ManagehotelsComponent } from './managehotels/managehotels.component';
import { ContactusComponent } from './contactus/contactus.component';
import { AddPostComponent } from './add-post/add-post.component';
import { ReservationComponent } from './reservation/reservation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ReservationhotelComponent } from './reservationhotel/reservationhotel.component';
import { LogsComponent } from './logs/logs.component';
import { AddroomComponent } from './addroom/addroom.component';
import { PostsComponent } from './posts/posts.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { PaymentComponent } from './payment/payment.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { DashboardPropComponent } from './dashboard-prop/dashboard-prop.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    UsersListComponent,
    AddPostComponent,
    ManagehotelsComponent,
    FooterComponent,
    HeaderComponent,
    LandingComponent,
    ContactusComponent,
    ProfileComponent,
    AboutComponent,
    ForgotpasswordComponent,
    ReservationComponent,
    ReservationhotelComponent,
    LogsComponent,
    AddroomComponent,
    PostsComponent,
    PrivacyPolicyComponent,
    TermsConditionsComponent,
    PaymentComponent,
    DashboardAdminComponent,
    DashboardPropComponent,
    
  ],
  imports: [
    FormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatFormFieldModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
