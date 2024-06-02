import { Injectable } from "@angular/core";
import { Job, ScrapingService } from "../api";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "environments/environment.development";
import { SuperService } from "./super.service";

@Injectable({
  providedIn: 'root'
})
export class MyScrapingService extends SuperService<Job> {

    constructor() {
        super('http, environment.apiUrl, null');
      }

    getProgress(): Observable<number> {
        return new Observable(observer => {
          const eventSource = new EventSource(environment.apiUrl + '/api/Scraping/GetProgress');
          eventSource.onmessage = event => {
            observer.next(parseInt(event.data));
          };
          eventSource.onerror = error => {
            observer.error(error);
          };
          return () => {
            eventSource.close();
          };
        });
      }
}
