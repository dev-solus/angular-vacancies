import { inject, Injectable, NgZone } from "@angular/core";
import { Job, ScrapingService } from "../api";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "environments/environment.development";
import { SuperService } from "./super.service";
import { LocalService } from "../user/local.service";

@Injectable({
    providedIn: 'root'
})
export class GeminiService extends SuperService<Job> {
    readonly session = inject(LocalService);
    constructor() {
        super('Gemini');
    }

    generateCV(jobId: number): Observable<string> {
        return new Observable(observer => {
            const eventSource = new EventSource(environment.apiUrl + `/api/Gemini/generateCV?jobId=${jobId}&token=${this.session.token}`);
            // const eventSource = new EventSource(`${environment.apiUrl}/api/${this.controller}/ScrapeOffers=${numbersString}`);
            eventSource.onmessage = event => {
                // console.log('event.data', event.data);
                observer.next(event.data);
            };
            eventSource.onerror = error => {
                // console.error('EventSource failed:', error);
                // observer.error(error);
                eventSource.close();
            };

            return () => {
                eventSource.close();
            };
        });
    }

    test2(text?: any): Observable<string> {
        return new Observable(observer => {
            const eventSource = new EventSource(environment.apiUrl + `/api/Gemini/Test3?text=${text}&token=${this.session.token}`);
            // const eventSource = new EventSource(`${environment.apiUrl}/api/${this.controller}/ScrapeOffers=${numbersString}`);
            eventSource.onmessage = event => {
                // console.log('event.data', event.data);
                observer.next(event.data);
            };
            eventSource.onerror = error => {
                // console.error('EventSource failed:', error);
                // observer.error(error);
                eventSource.close();
            };

            return () => {
                eventSource.close();
            };
        });
    }
}

