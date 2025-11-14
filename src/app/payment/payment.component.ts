import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../payment.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})


  export class PaymentComponent {
    roomData: any = [];
    constructor(private route: ActivatedRoute, private paymentService: PaymentService, private http: HttpClient) { }
    ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        if (params['room']) {
          this.roomData = JSON.parse(params['room']);
        }
      });

    }

    cancel(){

    }
    initiatePayment(amount: number) {
      this.http.post<any>('http://localhost:3000/api/initiate-payment', { amount })
        .subscribe(
          (response) => {
            // Handle successful payment initiation
            console.log('Payment initiated:', response);
            if (response.redirectUrl) {
              // Open PayPal checkout page in a new popup window
              const popupWindow = window.open(response.redirectUrl, '_blank', 'width=600,height=600');
              if (popupWindow) {
                popupWindow.focus();
              } else {
                // Popup blocked, handle error
                console.error('Popup blocked');
              }
            } else {
              // Redirect URL not found in response, handle error
              console.error('Redirect URL not found');
            }
          },
          (error) => {
            // Handle payment initiation error
            console.error('Failed to initiate payment:', error);
          }
        );
    }
    
  }
  