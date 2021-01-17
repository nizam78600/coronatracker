import { dateWiseData } from './../models/date-wise-data';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { catchError, map } from 'rxjs/operators';
import { globalDataSummary } from './../models/global-data';

@Injectable({
  providedIn: 'root',
})
export class DataServiceService {
  private baseUrl =
    'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/';
  private globalDataUrl = '';

  private extension = '.csv';
  month;
  date;
  year;
  getDate(date: number) {
    if (date < 10) {
      return '0' + date;
    }

    return date;
  }

  private dateWiseDataUrl =
    'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';

  constructor(private http: HttpClient) {
    let now = new Date();
    this.month = now.getMonth() + 1;
    this.date = now.getDate();
    this.year = now.getFullYear();
    // console.log({
    //   date: this.date,
    //   month: this.month,
    //   year: this.year,
    // });
    this.globalDataUrl = `${this.baseUrl}${this.getDate(
      this.month
    )}-${this.getDate(this.month)}-${this.year}${this.extension}`;

    // console.log(this.globalDataUrl);
  }
  getDateWiseData() {
    return this.http.get(this.dateWiseDataUrl, { responseType: 'text' }).pipe(
      map((result) => {
        let rows = result.split('\n');
        let mainData: any = {};
        let header = rows[0];
        let dates = header.split(/,(?=\S)/);
        dates.splice(0, 4);
        rows.splice(0, 1);
        rows.forEach((row) => {
          let cols = row.split(/,(?=\S)/);
          let con = cols[1];
          cols.splice(0, 4);
          // console.log(con, cols);
          mainData[con] = [];
          cols.forEach((value, index) => {
            let dw: dateWiseData = {
              cases: +value,
              country: con,
              date: new Date(Date.parse(dates[index])),
            };
            mainData[con].push(dw);
          });
        });
        // console.log(mainData);

        return mainData;
      })
    );
  }

  getGlobalData(): any {
    return this.http.get(this.globalDataUrl, { responseType: 'text' }).pipe(
      map((result) => {
        let data: any[] = [];
        let raw: any = {};
        let rows = result.split('\n');
        rows.splice(0, 1);

        // console.log(rows);
        rows.forEach((row) => {
          let cols = row.split(/,(?=\S)/);
          // console.warn(cols);
          let cs: any = {
            country: cols[3],
            confirmed: +cols[7],
            deaths: +cols[8],
            recovered: +cols[9],
            active: +cols[10],
          };
          let temp: any = raw[cs.country];
          if (temp) {
            temp.active = cs.active + temp.active;
            temp.confirmed = cs.confirmed + temp.confirmed;
            temp.deaths = cs.deaths + temp.deaths;
            temp.recovered = cs.recovered + temp.recovered;

            raw[cs.country] = temp;
          } else {
            raw[cs.country] = cs;
          }
        });
        // console.log(raw);
        return <globalDataSummary[]>Object.values(raw);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status == 404) {
          this.date = this.date - 1;
          this.globalDataUrl = `${this.baseUrl}${this.getDate(
            this.month
          )}-${this.getDate(this.month)}-${this.year}${this.extension}`;
          console.log(this.globalDataUrl);
          return this.getGlobalData();
        }
      })
    );
  }
}
