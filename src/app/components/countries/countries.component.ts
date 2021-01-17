import { map } from 'rxjs/operators';
import { dateWiseData } from './../../models/date-wise-data';
import { Component, OnInit } from '@angular/core';
import { globalDataSummary } from './../../models/global-data';
import { DataServiceService } from './../../services/data-service.service';
import { merge } from 'rxjs';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css'],
})
export class CountriesComponent implements OnInit {
  data: any[] = [];
  countries: string[] = [];
  totalConfirmed = 0;
  totalRecovered = 0;
  totalDeaths = 0;
  totalActive = 0;
  selectedCountryData: dateWiseData[] = [];
  dateWiseData: any;
  loading = true;
  datatable: any = [];
  chart = {
    LineChart: 'LineChart',
    height: 500,
    options: {
      animation: {
        duration: 1000,
        easing: 'out',
      },
    },
  };

  constructor(private service: DataServiceService) {}

  ngOnInit(): void {
    merge(
      this.service.getDateWiseData().pipe(
        map((result) => {
          this.dateWiseData = result;
        })
      ),
      this.service.getGlobalData().pipe(
        map((result: any) => {
          this.data = result;
          this.data.forEach((cs) => {
            this.countries.push(cs.country);
          });
        })
      )
    ).subscribe({
      complete: () => {
        this.updateValues('India');
        this.loading = false;
      },
    });
    // console.log(this.countries);
  }

  updateChart() {
    this.datatable = [];
    // this.datatable.push(['Date', 'Cases']);
    this.selectedCountryData.forEach((cs) => {
      this.datatable.push([cs.date, cs.cases]);
    });
  }

  updateValues(country: string) {
    // console.log(country);

    this.data.forEach((c) => {
      if (c.country == country) {
        this.totalConfirmed = c.confirmed;
        this.totalDeaths = c.deaths;
        this.totalActive = c.active;
        this.totalRecovered = c.recovered;
      }
    });
    this.selectedCountryData = this.dateWiseData[country];
    // console.log(this.selectedCountryData);
    this.updateChart();
  }
}
