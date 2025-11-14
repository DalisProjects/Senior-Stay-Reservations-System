// log.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  logs: { message: string; timestamp: string; senderid: number; sender: string }[] = [];

  log(message: string, senderid: number, sender: string): void {
    const timestamp = new Date().toLocaleString();
    this.logs.unshift({ message, timestamp, senderid, sender });
    // You can also send this log to your backend or any other service here
  }
}