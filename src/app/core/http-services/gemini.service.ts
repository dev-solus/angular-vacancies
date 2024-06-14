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

    test(text?: string): Observable<any> {
        return new Observable(observer => {
            const eventSource = new EventSource(environment.apiUrl + `/api/Gemini/Test?text=${text}&token=${this.session.token}`);
            // const eventSource = new EventSource(`${environment.apiUrl}/api/${this.controller}/ScrapeOffers=${numbersString}`);
            eventSource.onmessage = event => {
                console.log('event.data', event.data);
                observer.next(event.data);
            };
            eventSource.onerror = error => {
                observer.error(error);
            };
            return () => {
                eventSource.close();
            };
        });
    }

    test2(text?: string): Observable<any> {
        return new Observable(observer => {
            const eventSource = new EventSource(environment.apiUrl + `/api/Gemini/Test2?text=${text}&token=${this.session.token}`);
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

