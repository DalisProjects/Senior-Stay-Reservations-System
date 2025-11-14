import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  logs: any

  constructor( public authService: AuthService) { }

  ngOnInit(): void {
    console.log(this.authService.logs)
  }

}

