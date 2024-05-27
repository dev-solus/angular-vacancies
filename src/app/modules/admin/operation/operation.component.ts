import { Component, ViewChild, Signal, AfterViewInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { merge, Subject, switchMap, filter, map, startWith, tap, delay, catchError, debounceTime, distinctUntilChanged } from 'rxjs';
import { Account, Operation, User } from 'app/core/api';
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
import { CachedService } from './cached.service';
import { MySelectComponent } from "@fuse/my-select/my-select.component";
import {MatChipsModule} from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { sumBy } from 'lodash';

@Component({
    standalone: true,
    selector: 'app-operation',
    templateUrl: './operation.component.html',
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
        MySelectComponent,
        MatChipsModule,
        MatAutocompleteModule,
    ]
})
export class OperationComponent implements AfterViewInit {
    //DI
    readonly uow = inject(UowService);
    readonly cached = inject(CachedService);

    readonly dialog = inject(MatDialog);

    @ViewChild(MatPaginator, { static: true })
    readonly paginator: MatPaginator;
    @ViewChild(MatSort, { static: true })
    readonly sort: MatSort;

    readonly update = new Subject<number>();

    public isLoadingResults = true;
    public totalRecords = 0;

    readonly isAdmin = this.uow.session.isAdmin;

    readonly showMessage$ = new Subject<any>();

    readonly delete$ = new Subject<Operation>();
    readonly #delete$ = toSignal( this.delete$.pipe(
        switchMap(item => this.uow.fuseConfirmation.open().afterClosed().pipe(
            filter((e: 'confirmed' | 'cancelled') => e === 'confirmed'),
            tap(e => console.warn(e)),
            switchMap(_ => this.uow.core.operations.delete(item.id).pipe(
                catchError(this.uow.handleError),
                map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? "Vous ne pouvez pas supprimer car il est lié à d'autres enregistrements" : 'Enregistrement réussi' })),
                tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
                tap(e => e.code > 0 && this.update.next(10)),
            )),
        )),
    ));


    // readonly users$ = this.cached.users$;

    // select
    readonly accounts$ =this.update.pipe(
        startWith(0),
        // filter(e => e === 10),
        filter(_ => !!this.userId.value?.id),
        switchMap(_ => this.uow.core.accounts.getAllByUserId(+this.userId.value?.id).pipe(
            catchError(this.uow.handleError),
        )),
        // map(list => list.filter(e => +e.user_id === +this.userId.value?.id )),
        map((list: Account[]) => ({ list, total: sumBy(list, e => e.balance) })),
    );


    readonly userId = new FormControl<User | string | any>(this.isAdmin() ? null : (this.uow.session.user() || null));
    readonly accountId = new FormControl(0);

    readonly users$ = this.userId.valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(300),
        filter(e => typeof e === 'string'),
        switchMap(e => this.uow.core.users.autoComplete(e).pipe(
            catchError(this.uow.handleError),
            map(e => e as User[]),
        )),
    );

    readonly viewInitDone = new Subject<void>();
    readonly dataSource: Signal<(Operation)[]> = toSignal(this.viewInitDone.pipe(
        delay(50),
        switchMap(_ => merge(
            this.sort.sortChange,
            this.paginator.page,
            this.update,
        )),
        startWith(null as any),
        map(_ => [
            (this.paginator?.pageIndex || 0),
            this.paginator?.pageSize ?? 10,
            this.sort?.active ? this.sort?.active : 'id',
            this.sort?.direction ? this.sort?.direction : 'desc',
            +this.userId.value?.id || 0,
            +this.accountId.value || 0,
        ]),
        tap(e => this.isLoadingResults = true),
        switchMap(e => this.uow.core.operations.getList(e).pipe(
            catchError(this.uow.handleError),
            tap(e => this.totalRecords = e.count),
            map(e => e.list.map(a => {
                (a.accountCredit as any).value = a.accountCredit.user_id === this.userId.value?.id ? 'credit' : null;
                (a.accountDebit as any).value = a.accountDebit.user_id === this.userId.value?.id ? 'debit' : null;
                return a;
            })),
        )),
        tap(e => this.isLoadingResults = false),
    ), { initialValue: [] }) as any;

    ngAfterViewInit(): void {
        this.viewInitDone.next();
    }

    isString = (e) => typeof e === 'string' || typeof e === 'number';

    display = (e: any) => {
        console.warn(e);
        return this.isString(e) || !!!e ? e : `${e?.firstname} ${e?.lastname} (CIN: ${e?.cin})` ?? ''
    };

    test(e) {
        console.warn(e);
    }


    trackById(index: number, item: any): number {
        return item.id; // Assuming "id" is a unique identifier for each item
    }

    reset() {
        this.userId.setValue(null);
        this.accountId.setValue(0);

        this.update.next(0);
    }

    search() {
        this.update.next(0);
    }

    openDialog(o: Operation, text) {
        const dialogRef = this.dialog.open(UpdateComponent, {
            // width: '1100px',
            disableClose: true,
            data: { model: o, title: text }
        });

        return dialogRef.afterClosed();
    };

    add() {
        this.openDialog({} as Operation, 'Ajouter Operation').subscribe(result => {
            if (result) {
                this.update.next(10);
            }
        });
    }

    edit(o: Operation) {
        this.openDialog(o, 'Modifier Operation').subscribe((result: Operation) => {
            if (result) {
                this.update.next(10);
            }
        });
    }

    remove(o: Operation) {
        this.delete$.next(o);
    }
}
