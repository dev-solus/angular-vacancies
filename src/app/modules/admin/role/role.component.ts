import { Component, ViewChild, Signal, AfterViewInit, ChangeDetectionStrategy, inject, viewChild } from '@angular/core';
import { merge, Subject, switchMap, filter, map, startWith, tap, delay, catchError } from 'rxjs';
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
import { Role } from 'app/core/api';


@Component({
    standalone: true,
    selector: 'app-role',
    templateUrl: './role.component.html',
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
    ],
})
export class RoleComponent implements AfterViewInit {
    //DI
    readonly uow = inject(UowService);


    readonly dialog = inject(MatDialog);

    @ViewChild(MatPaginator, { static: false })
    readonly paginator: MatPaginator;
    @ViewChild(MatSort, { static: false })
    readonly sort: MatSort;

    // readonly paginator = viewChild.required<MatPaginator>('paginator')();
    // readonly sort = viewChild.required<MatSort>(MatSort)();


    readonly update = new Subject<number>();

    public isLoadingResults = true;
    public totalRecords = 0;

    readonly delete$ = new Subject<Role>();
    readonly #delete$ = this.delete$.pipe(
        switchMap(item => this.uow.fuseConfirmation.open().afterClosed().pipe(
            filter((e: 'confirmed' | 'cancelled') => e === 'confirmed'),
            tap(e => console.warn(e)),
            switchMap(_ => this.uow.core.roles.delete(item.id).pipe(
                catchError(this.uow.handleError),
                map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
                tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
            )),
        )),
    );

    readonly viewInitDone = new Subject<void>();
    readonly dataSource = this.viewInitDone.pipe(
        // delay(100),
        switchMap(_ => merge(
            this.sort.sortChange,
            this.paginator.page,
            this.update,
            this.#delete$,
        )),
        startWith(null as any),
        map(_ => [
            (this.paginator?.pageIndex || 0) ,// * (this.paginator?.pageSize ?? 10),// startIndex
            this.paginator?.pageSize ?? 10,
            this.sort?.active ? this.sort?.active : 'id',
            this.sort?.direction ? this.sort?.direction : 'desc',
            this.name.value === '' ? '*' : this.name.value,
        ]),
        tap(e => this.isLoadingResults = true),
        switchMap(e => this.uow.core.roles.getList(e).pipe(
            tap(e => this.totalRecords = e.count),
            map(e => e.list))
        ),
        tap(e => this.isLoadingResults = false),
    );

    readonly showMessage$ = new Subject<any>();

    // select


    readonly name = new FormControl('');

    ngAfterViewInit(): void {
        this.viewInitDone.next();
    }

    trackById(index: number, item: any): number {
        return item.id; // Assuming "id" is a unique identifier for each item
    }

    reset() {
        this.name.setValue('');

        this.update.next(0);
    }

    search() {
        this.update.next(0);
    }

    openDialog(o: Role, text) {
        const dialogRef = this.dialog.open(UpdateComponent, {
            // width: '1100px',
            disableClose: true,
            data: { model: o, title: text }
        });

        return dialogRef.afterClosed();
    };

    add() {

        this.openDialog({} as Role, 'Ajouter Role').subscribe(result => {
            if (result) {
                this.update.next(0);
            }
        });
    }

    edit(o: Role) {

        this.openDialog(o, 'Modifier Role').subscribe((result: Role) => {
            if (result) {
                this.update.next(0);
            }
        });
    }

    remove(o: Role) {
        this.delete$.next(o);
    }


}
