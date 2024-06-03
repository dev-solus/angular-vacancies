import { Component, ViewChild, Signal, AfterViewInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { merge, Subject, switchMap, filter, map, startWith, tap, delay, catchError } from 'rxjs';
import { Job } from 'app/core/api';
import { UowService, TypeForm } from 'app/core/http-services/uow.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FuseAlertComponent } from '@fuse/components/alert';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { toSignal } from '@angular/core/rxjs-interop';
import { UpdateComponent } from './update/update.component';
import { MatDialog } from '@angular/material/dialog';

import { MyImageComponent } from '@fuse/upload-file/display-image/my-image.component';
import { AddComponent } from './add/add.component';


@Component({
    standalone: true,
    selector: 'app-job',
    templateUrl: './job.component.html',
    styles: [``],
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
        MatProgressSpinnerModule,

        MyImageComponent,

    ],
})
export class JobComponent implements AfterViewInit {
    //DI
    readonly uow = inject(UowService);


    readonly dialog = inject(MatDialog);

    @ViewChild(MatPaginator, { static: true })
    readonly paginator: MatPaginator;
    @ViewChild(MatSort, { static: true })
    readonly sort: MatSort;

    readonly update = new Subject<number>();

    public isLoadingResults = true;
    public totalRecords = 0;

    readonly showMessage$ = new Subject<any>();

    readonly delete$ = new Subject<Job>();
    readonly #delete$ = this.delete$.pipe(
        switchMap(item => this.uow.fuseConfirmation.open({ message: 'Job' }).afterClosed().pipe(
            filter((e: 'confirmed' | 'cancelled') => e === 'confirmed'),
            tap(e => console.warn(e)),
            switchMap(_ => this.uow.core.jobs.delete(item.id).pipe(
                catchError(this.uow.handleError),
                map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
                tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
            )),
        )),
    );

    // select

    readonly viewInitDone = new Subject<void>();
    readonly dataSource: Signal<(Job)[]> = toSignal(this.viewInitDone.pipe(
        delay(50),
        switchMap(_ => merge(
            this.sort.sortChange,
            this.paginator.page,
            this.update,
            this.#delete$,
        )),
        // startWith(null as any),
        map(_ => [
            (this.paginator?.pageIndex || 0) * (this.paginator?.pageSize ?? 10),// startIndex
            this.paginator?.pageSize ?? 10,
            this.sort?.active ? this.sort?.active : 'id',
            this.sort?.direction ? this.sort?.direction : 'desc',

        ]),
        tap(e => this.isLoadingResults = true),
        switchMap(e => this.uow.core.jobs.getList(e).pipe(
            tap(e => this.totalRecords = e.count),
            map(e => e.list))
        ),
        tap(e => this.isLoadingResults = false),
    ), { initialValue: [] }) as any;

    ngAfterViewInit(): void {
        // this.viewInitDone.next();
        this.uow.core.myScrapings.scrapeOffers([1,2]).subscribe(
            r => {
                console.log(`Progress: ${r}%`);
            }
        );
    }

    trackById(index: number, item: any): number {
        return item.id; // Assuming "id" is a unique identifier for each item
    }

    reset() {


        this.update.next(0);
    }

    search() {
        this.update.next(0);
    }

    openDialog(o: Job, text) {
        const dialogRef = this.dialog.open(UpdateComponent, {
            // width: '1100px',
            disableClose: true,
            data: { model: o, title: text }
        });

        return dialogRef.afterClosed();
    };

    add() {
        this.dialog.open(AddComponent, {
            // width: '1100px',
            disableClose: true,
            data: { model: {}, title: 'Add' }
        }).afterClosed().subscribe(result => {
            if (result) {
                this.update.next(0);
            }
        });
    }

    edit(o: Job) {
        this.openDialog(o, 'Modifier Job').subscribe((result: Job) => {
            if (result) {
                this.update.next(0);
            }
        });
    }

    remove(o: Job) {
        this.delete$.next(o);
    }


}
