import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { RouterModule } from '@angular/router';
import { FuseAlertComponent } from '@fuse/components/alert';
import { Job } from 'app/core/api';
import { UowService } from 'app/core/http-services/uow.service';
import { debounceTime, map, merge, startWith, Subject, switchMap, tap } from 'rxjs';
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
export class HomeComponent {
    readonly uow = inject(UowService);

    // @ViewChild(MatPaginator, { static: true })
    // readonly paginator0: MatPaginator;

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

    readonly #all$ = this.uow.core.filters.get$;

    readonly contractTypes$ = this.#all$.pipe(map(e => e.filter(f => f.name === 'contract').map(e => e.list).flat()));
    readonly locations$ = this.#all$.pipe(map(e => e.filter(f => f.name === 'location').map(e => e.list).flat()));
    readonly skills$ = this.#all$.pipe(map(e => e.filter(f => f.name === 'skills').map(e => e.list).flat()));

    readonly name = new FormControl('');
    readonly contractType = new FormControl<string[]>(['']);
    readonly location = new FormControl<string[]>(['']);
    readonly skill = new FormControl<string[]>(['']);

    readonly update$ = new Subject<void>();


    readonly dataSource = toSignal(merge(
        this.name.valueChanges,
        this.contractType.valueChanges,
        this.location.valueChanges,
        this.skill.valueChanges,
        this.update$,
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


    readonly selectedJob = signal<Job>(null);
    readonly onSelect$ = new Subject<Job>();

}