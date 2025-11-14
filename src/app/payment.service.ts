import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) { }

  initiatePayment(amount: number) {
    return this.http.post<any>('http://localhost:3000/api/initiate-payment', { amount });
  }

  capturePayment(orderId: string) {
    return this.http.post<any>('http://localhost:3000/api/capture-payment', { orderId });
  }
}
