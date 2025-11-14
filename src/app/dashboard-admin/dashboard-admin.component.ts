import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OnlineusersService } from '../onlineusers.service';
import Chart from 'chart.js/auto';


@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent {
  overallStats: any = {
    TotalReservations: 0,
    TotalRevenue: 0,
    TotalListings: 0,
  }
  filteredstats: any = {
    TotalReservations: 0,
    TotalRevenue: 0,
  }
  selectedStats: any;
  selectedTimePeriod: string = 'last24';
  duree: string | undefined;
  SelectedType: string = "EPHAD"


  constructor(public onlineusers: OnlineusersService, private http: HttpClient) {
    this.fetchOverallStatistics(); // Fetch overall statistics when component initializes
    this.fetchStatistics();
  }

  drawLineChart(data: any[]) {
    console.log(data);
    
    // Group data by month and year
    const aggregatedData = data.reduce((acc, curr) => {
      const dateAdded = new Date(curr.DateAdded);
      const year = dateAdded.getFullYear();
      const month = dateAdded.toLocaleString('default', { month: 'short' });
      const key = `${month}-${year}`;
      
      if (!acc[key]) {
        acc[key] = {
          TotalReservations: curr.TotalReservations,
          TotalRevenue: curr.TotalRevenue
        };
      } else {
        acc[key].TotalReservations += curr.TotalReservations;
        acc[key].TotalRevenue += curr.TotalRevenue;
      }
      return acc;
    }, {});
    // Extract unique months and years
    const uniqueMonths = [...new Set(data.map(item => new Date(item.DateAdded).toLocaleString('default', { month: 'short' })))];
    const uniqueYears = [...new Set(data.map(item => new Date(item.DateAdded).getFullYear()))];
    
    // Create datasets for each year
    const datasets = uniqueYears.map(year => {
      const revenues = uniqueMonths.map(month => {
        const key = `${month}-${year}`;
        return aggregatedData[key] ? aggregatedData[key].TotalRevenue : 0;
      });
      
      return {
        label: `Revenu total généré (${year})`,
        data: revenues,
        borderColor: '',
        fill: true
      };
    });
    const datasetss = uniqueYears.map(year => {
      const newusers = uniqueMonths.map(month => {
        const key = `${month}-${year}`;
        return aggregatedData[key] ? aggregatedData[key].TotalReservations : 0;
      });
      
      return {
        label: `Comptes creer (${year})`,
        data: newusers,
        borderColor: '',
        fill: true
      };
    });
    const allDatasets = [...datasets, ...datasetss];

    new Chart('lineChart', {
      type: 'line',
      data: {
        labels: uniqueMonths,
        datasets: allDatasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
}

  

  fetchOverallStatistics() {
    // Replace the URL with your backend endpoint to fetch overall statistics
    this.http.get<any>('http://localhost:3000/api/overall-statistics')
      .subscribe(data => {
        this.overallStats = data;
        this.drawLineChart(this.overallStats);
        this.calculateOverallStats(); // Calculate overall statistics when data is fetched
        // Call drawLineChart method passing the data for chart
      });
  }

  calculateOverallStats() {
    if (!this.overallStats) {
      return; // Exit if overallStats is undefined
    }
    // Assuming 'data' is the array of statistics you provided
    const data = this.overallStats;
    this.overallStats = {
      totalReservations: data.reduce((acc: number, curr: any) => acc + curr.TotalReservations, 0),
      totalRevenue: data.reduce((acc: number, curr: any) => acc + curr.TotalRevenue, 0),
      totalListings: data.reduce((acc: number, curr: any) => acc + curr.TotalListings, 0),
    };
  }

  fetchStatistics() {
    // Replace the URL with your backend endpoint to fetch statistics based on selected time period
       console.log(this.SelectedType)
        if(this.selectedTimePeriod){
          this.http.get<any>('http://localhost:3000/api/statistics/' + this.selectedTimePeriod)
          .subscribe(data => {
        // Calculate totals
        const totals = {
          totalReservations: 0,
          totalRevenue: 0,
          totalListings: 0,};

        data.forEach((stat: any) => {
          totals.totalReservations += stat.TotalReservations;
          totals.totalRevenue += stat.TotalRevenue;
          totals.totalListings += stat.TotalListings;
        });
        if(this.selectedTimePeriod == "last24"){
            this.duree = " Statistiques des dernières 24 heures"}
        if(this.selectedTimePeriod == "lastWeek"){
          this.duree = "Statistiques de la semaine dernière"}
        if(this.selectedTimePeriod == "lastMonth"){
          this.duree = "Statistiques de le mois dernier"}
        if(this.selectedTimePeriod == "lastYear"){
        this.duree = "Statistiques de l'année dernière"}
        // Assign calculated totals to selectedStats
        this.selectedStats = totals;
      });
      }
      if(this.SelectedType) {
        this.http.get<any>('http://localhost:3000/api/overall-statistics')
        .subscribe(data => {
          let filteredData = data.filter((stat: any) => stat.bookingType === this.SelectedType);
          const totalss = {
            totalReservations: 0,
            totalRevenue: 0,
            };

            filteredData.forEach((stat: any) => {
              totalss.totalReservations += stat.TotalReservations;
              totalss.totalRevenue += stat.TotalRevenue;
            });
            this.filteredstats = totalss;
      });
  
  }
}
}