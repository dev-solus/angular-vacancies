import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, signal, viewChild, ViewChild, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FuseAlertComponent } from '@fuse/components/alert';
import { Job } from 'app/core/api';
import { UowService } from 'app/core/http-services/uow.service';
import { debounceTime, filter, map, merge, of, startWith, Subject, switchMap, take, tap } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { HomeService } from './home.service';

@Component({
    standalone: true,
    selector: 'app-home',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './home.component.html',
    styles: [`
        ::ng-deep .mat-paginator-container {
            justify-content: flex-end;
        }

        ::ng-deep .mat-paginator-range-label {
            display: none;
        }

        ::ng-deep .mat-paginator-page-size {
            display: none;
        }

        ::ng-deep .mat-paginator-first-page-button,
        ::ng-deep .mat-paginator-last-page-button,
        ::ng-deep .mat-paginator-quick-access-input {
            display: none;
        }
        `],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FuseAlertComponent,
        MatPaginatorModule,
        FormsModule,
        ReactiveFormsModule,
        MatSortModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        RouterModule,
        MatProgressBarModule,
        MatAutocompleteModule,
        MatChipsModule,
    ],
})
export class HomeComponent implements AfterViewInit {
    readonly uow = inject(UowService);
    readonly router = inject(Router);
    readonly route = inject(ActivatedRoute);
    readonly service = inject(HomeService);

    readonly paginator = viewChild.required(MatPaginator);
    readonly sort = viewChild(MatSort);

    readonly totalRecords = signal(0);
    readonly isloading = signal(false);

    // readonly orderBy = [
    //     'Date',
    //     'Salary',
    //     'Localisation',
    //     'ContractType',
    //     'Skill',
    // ];

    readonly #all$ = of([])// this.uow.core.filters.get$;

    readonly contractTypes$ = this.#all$.pipe(map(e => e.filter(f => f.name === 'contract').map(e => e.list).flat()));
    readonly locations$ = this.#all$.pipe(map(e => e.filter(f => f.name === 'location').map(e => e.list).flat()));
    readonly skills$ = this.#all$.pipe(map(e => e.filter(f => f.name === 'skills').map(e => e.list).flat()));

    readonly name = new FormControl('');
    readonly contractType = new FormControl<string[]>([]);
    readonly location = new FormControl<string[]>([]);
    readonly skill = new FormControl<string[]>([]);

    readonly dataSource = toSignal(merge(
        this.name.valueChanges,
        this.contractType.valueChanges,
        this.location.valueChanges,
        this.skill.valueChanges,
    ).pipe(
        startWith(null),
        debounceTime(500),
        tap(() => this.isloading.set(true)),
        map(() => [
            (this.paginator()?.pageIndex || 0) * (this.paginator()?.pageSize ?? 10),// startIndex
            this.paginator()?.pageSize ?? 10,
            this.sort()?.active ? this.sort()?.active : 'id',
            this.sort()?.direction ? this.sort()?.direction : 'desc',
            this.name.value,
            this.contractType.value.filter(e => !!e),
            this.location.value.filter(e => !!e),
            this.skill.value.filter(e => !!e),
        ]),
        // @ts-ignore
        switchMap((e) => this.uow.core.jobs.apiJobsGetJobsGet(...e).pipe(
            tap(e => this.totalRecords.set(e.count)),
            map(e => e.list),
            // map(e => []),
        )),
        tap(() => this.isloading.set(false)),
    ), { initialValue: [] });

    readonly jobId = toSignal(this.route.queryParamMap.pipe(
        // tap(e => console.log(e.get('id'))),
        map(e => +e.get('id')),
    ), { initialValue: 0 });

    // recover last visiting job if id exist in the url
    readonly getJob = toSignal(this.route.queryParamMap.pipe(
        take(1),
        map(e => +e.get('id')),
        filter(e => !!e),
        switchMap(e => this.uow.core.jobs.getById(e)),
        tap(e => this.service.selectedJob.next(e)),
    ));

    ngAfterViewInit(): void {
        // this.uow.core.gemini.test2().subscribe(r => {
        //     console.log(r);
        // });
    }

    jobClick(e: Job) {
        this.service.selectedJob.next(e);
        this.router.navigate([''], { queryParams: { id: e.id } });
    }
}
