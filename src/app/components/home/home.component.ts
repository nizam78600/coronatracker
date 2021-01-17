import { globalDataSummary } from './../../models/global-data';
import { DataServiceService } from './../../services/data-service.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  totalConfirmed = 0;
  totalActive = 0;
  totalDeaths = 0;
  totalRecovered = 0;
  loading = true;

  globalData: any[] = [];
  datatable: any = [];

  chart = {
    PieChart: 'PieChart',
    ColumnChart: 'ColumnChart',
    height: 500,
    options: {
      height: 500,
      animation: {
        duration: 1000,
        easing: 'out',
      },
      is3D: true,
    },
  };

  constructor(private dataService: DataServiceService) {}

  initChart(caseType: string) {
    this.datatable = [];
    // this.datatable.push(['Country', 'Cases']);
    this.globalData.forEach((cs) => {
      let value: any;
      if (caseType == 'c') if (cs.confirmed > 200000) value = cs.confirmed;
      if (caseType == 'a') if (cs.active > 1000) value = cs.active;
      if (caseType == 'd') if (cs.deaths > 1000) value = cs.deaths;
      if (caseType == 'r') if (cs.recovered > 4000) value = cs.recovered;
      this.datatable.push([cs.country, value]);
    });

    // console.log(this.datatable);
  }

  ngOnInit(): void {
    this.dataService.getGlobalData().subscribe({
      next: (result: any[]) => {
        // console.log(result);
        this.globalData = result;
        result.forEach((cs) => {
          if (!Number.isNaN(cs.confirmed)) {
            (this.totalActive += cs.active),
              (this.totalConfirmed += cs.confirmed),
              (this.totalDeaths += cs.deaths),
              (this.totalRecovered += cs.recovered);
          }
        });
        this.initChart('c');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
  updateChart(input: HTMLInputElement) {
    // console.log(input.value);
    this.initChart(input.value);
  }
}
