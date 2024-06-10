import { Injectable } from '@angular/core';
import { Job } from 'app/core/api';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HomeService {
    readonly selectedJob = new BehaviorSubject<Job>(null);

}
