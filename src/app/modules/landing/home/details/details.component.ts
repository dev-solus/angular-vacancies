import { CommonModule } from '@angular/common';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { HomeService } from '../home.service';
import { map, Subject, switchMap, tap } from 'rxjs';
import { Job } from 'app/core/api';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { toSignal } from '@angular/core/rxjs-interop';
import { labelColorDefs } from '../home.constants';
import moment from 'moment';
import { UowService } from 'app/core/http-services/uow.service';

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
        FuseScrollResetDirective,
    ],
})
export class DetailsComponent {
    readonly service = inject(HomeService);
    readonly router = inject(Router);
    readonly uow = inject(UowService);

    readonly labelColors = labelColorDefs;

    readonly selectedJob$ = this.service.selectedJob;

    readonly labels = toSignal(this.selectedJob$.pipe(
        map(e => [{
            title: 'Enregistré',
            color: 'green',
        }, {
            title: moment(e?.originalDate).fromNow(),
            color: 'purple',
        }]),
    ), { initialValue: [] });

    readonly submit$ = new Subject<void>();
    readonly #submissions = this.submit$.pipe(
        switchMap(() => this.uow.core.submissions.post({ jobId: this.selectedJob$.value.id })),
        tap(r => console.warn(r)),
    );




    // add function that open a new tab with a link to the job
    openLink(url: string): void {
        this.submit$.next();
        window.open(url, '_blank');
    }

    toCV() {
        this.submit$.next();
        this.router.navigate(['/cv'], { queryParamsHandling: 'merge' });
    }

}
