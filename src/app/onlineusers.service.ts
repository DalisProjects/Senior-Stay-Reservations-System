import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OnlineusersService {

  private lastActivityTimes: { [key: string]: number } = {};
  private activityTimer: any;
  public onlineUsers: number = 0;

  constructor() {
    this.initActivityTracking();
  }

  private initActivityTracking(): void {
    window.addEventListener('mousemove', (event) => this.onActivity(event));
    window.addEventListener('keypress', (event) => this.onActivity(event));
    // Check user activity every minute
    this.activityTimer = setInterval(() => this.updateOnlineUsers(), 60000);
  }

  private onActivity(event: MouseEvent | KeyboardEvent): void {
    const userId = 'user'; // Replace with a unique user identifier (e.g., user ID or username)
    this.lastActivityTimes[userId] = Date.now();
  }

  private updateOnlineUsers(): void {
    console.log(this.onlineUsers)
    const activityThreshold = 5 * 60 * 1000; // 5 minutes
    const currentTime = Date.now();
    let count = 0;

    // Count the number of users with recent activity
    for (const userId in this.lastActivityTimes) {
      if (currentTime - this.lastActivityTimes[userId] < activityThreshold) {
        count++;
      } else {
        delete this.lastActivityTimes[userId]; // Remove inactive users from the tracking
      }
    }

    this.onlineUsers = count;
  }

  ngOnDestroy(): void {
    // Clean up event listeners and timer
    window.removeEventListener('mousemove', (event) => this.onActivity(event));
    window.removeEventListener('keypress', (event) => this.onActivity(event));
    clearInterval(this.activityTimer);
  }
}
