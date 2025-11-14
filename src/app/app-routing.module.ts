import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LandingComponent } from './landing/landing.component';
import { ProfileComponent } from './profile/profile.component';
import { AboutComponent } from './about/about.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { UsersListComponent } from './userslist/userslist.component';
import { ManagehotelsComponent } from './managehotels/managehotels.component';
import { ContactusComponent } from './contactus/contactus.component';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';
import { AuthGuardLogin } from './auth.logged';
import { AddPostComponent } from './add-post/add-post.component';
import { ReservationComponent } from './reservation/reservation.component';
import { ReservationhotelComponent } from './reservationhotel/reservationhotel.component';
import { LogsComponent } from './logs/logs.component';
import { AddroomComponent } from './addroom/addroom.component';
import { PostsComponent } from './posts/posts.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { PaymentComponent } from './payment/payment.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';



const routes: Routes = [
  {path:"",component:LandingComponent},
  {path:"reservation",component:ReservationComponent},
  {path:'reservation/:hotelid', component: ReservationhotelComponent}, // Add booking route with hotelid and roomId parameters
  {path:"addroom",component:AddroomComponent,canActivate: [AuthGuard]},
  {path:"login", component: LoginComponent, canActivate: [AuthGuardLogin]},
  {path:"register", component: RegisterComponent, canActivate: [AuthGuardLogin]},
  {path:"forgotpassword",component:ForgotpasswordComponent},   
  {path:"profile",component:ProfileComponent,canActivate: [AuthGuard]},
  {path:"about",component:AboutComponent},
  {path:"userslist",component:UsersListComponent, canActivate: [AuthGuard,AdminGuard]}, 
  {path:"managehotels",component:ManagehotelsComponent, canActivate: [AuthGuard,AdminGuard]}, 
  {path:"contactus",component:ContactusComponent},  
  {path:"addpost",component:AddPostComponent, canActivate: [AuthGuard]},  
  {path:"logs",component:LogsComponent, canActivate: [AuthGuard]}, 
  {path:"posts",component:PostsComponent, canActivate: [AuthGuard]},  
  {path:"privacyandpolicy",component:TermsConditionsComponent},
  {path:"termsandconditions",component:PrivacyPolicyComponent},
  {path:"payment/:hotelid/:roomid",component:PaymentComponent,canActivate: [AuthGuard]},
  {path:"DashboardAdmin",component:DashboardAdminComponent, canActivate: [AuthGuard,AdminGuard]}, 


  

 


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
