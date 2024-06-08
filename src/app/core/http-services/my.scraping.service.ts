import { inject, Injectable, NgZone } from "@angular/core";
import { Job, ScrapingService } from "../api";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "environments/environment.development";
import { SuperService } from "./super.service";

@Injectable({
    providedIn: 'root'
})
export class MyScrapingService extends SuperService<Job> {
    readonly zone = inject(NgZone);
    constructor() {
        super('Scraping');
    }

    getProgress(numbers?: number[]): Observable<any> {
        const numbersString = numbers?.join(',') ?? '';
        return new Observable(observer => {
            const eventSource = new EventSource(environment.apiUrl + `/api/Scraping/GetProgress?numbers=${numbersString}`);
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

    // scrapeOffers(numbers?: number[]): Observable<SubjectDto | any> {
    //     const numbersString = numbers?.join(',') ?? '';

    //     return new Observable(observer => {
    //         const eventSource = new EventSource(`${environment.apiUrl}/api/${this.controller}/ScrapeOffers?numbers=${numbersString}`);
    //         eventSource.onmessage = event => {
    //             this.zone.run(() => {
    //                 console.log('666666666666666666666666666');
    //                 observer.next(1);
    //                 // observer.next(event.data);
    //             });
    //         };

    //         eventSource.onerror = error => {
    //             this.zone.run(() => {
    //                 observer.error(error);
    //               });
    //             // if (eventSource.readyState === 0) {
    //             //     console.log('The stream has been closed by the server.');
    //             //     eventSource.close();
    //             //     observer.complete();
    //             // } else {
    //             //     observer.error('EventSource error: ' + error);
    //             // }
    //             // console.warn(error);
    //         };
    //         return () => {
    //             eventSource.close();
    //         };
    //     });
    // }
}

export class SubjectDto {
    code = 0;
    message = 0;
    payload = 0;
}
