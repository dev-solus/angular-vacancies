import { Injectable } from "@angular/core";
import { Job } from "../api";
import { Observable } from "rxjs";
import { SuperService } from "./super.service";

@Injectable({
    providedIn: 'root'
})
export class MyScrapingService extends SuperService<Job> {
    constructor() {
        super('Scraping');
    }

    getProgress(numbers?: number[]): Observable<any> {
        const numbersString = numbers?.join(',') ?? '';

        return this.getEventSource(`GetProgress?numbers=${numbersString}`);
    }
}

// export class SubjectDto {
//     code = 0;
//     message = 0;
//     payload = 0;
// }
