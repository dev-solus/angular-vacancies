import { CommonModule } from '@angular/common';
import { Component,  inject,  ViewEncapsulation } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import {RouterLink } from '@angular/router';
import { HomeService } from '../home.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        RouterLink,
        MatIconModule,
        MatRippleModule,
    ],
})
export class DetailsComponent {
    readonly service = inject(HomeService);

    readonly selectedJob$ = this.service.selectedJob;

    readonly submit$ = new Subject<void>();

}
