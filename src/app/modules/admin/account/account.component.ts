import { Component, ViewChild, Signal, AfterViewInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { merge, Subject, switchMap, filter, map, startWith, tap, delay, catchError } from 'rxjs';
import { Account, User } from 'app/core/api';
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
import { ActivatedRoute } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-account',
    templateUrl: './account.component.html',
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
export class AccountComponent implements AfterViewInit {
    //DI
    readonly uow = inject(UowService);
    readonly route = inject(ActivatedRoute);

    readonly dialog = inject(MatDialog);

    @ViewChild(MatPaginator, { static: true })
    readonly paginator: MatPaginator;
    @ViewChild(MatSort, { static: true })
    readonly sort: MatSort;

    readonly update = new Subject<number>();

    public isLoadingResults = true;
    public totalRecords = 0;

    readonly showMessage$ = new Subject<any>();

    readonly delete$ = new Subject<Account>();
    readonly #delete$ = this.delete$.pipe(
        switchMap(item => this.uow.fuseConfirmation.open().afterClosed().pipe(
            filter((e: 'confirmed' | 'cancelled') => e === 'confirmed'),
            tap(e => console.warn(e)),
            switchMap(_ => this.uow.core.accounts.delete(item.id).pipe(
                catchError(this.uow.handleError),
                map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? "Vous ne pouvez pas supprimer car il est lié à d'autres enregistrements" : 'Enregistrement réussi' })),
                tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
            )),
        )),
    );

    readonly userIdParams = +this.route.snapshot.queryParamMap.get('userId');

    // select
    readonly users = toSignal(this.uow.core.users.getForSelect$.pipe(
        // tap(users => this.user.set(!!this.userIdParams ? users.find(e => e.id === this.userIdParams)?.name : ''))
    ));


    readonly cin = new FormControl('');
    readonly balanceMin = new FormControl(0);
    readonly balanceMax = new FormControl(0);
    readonly userId = new FormControl(this.userIdParams);

    readonly user = signal<User>(null)

    readonly viewInitDone = new Subject<void>();
    readonly dataSource: Signal<(Account)[]> = toSignal(this.viewInitDone.pipe(
        delay(50),
        switchMap(_ => merge(
            this.sort.sortChange,
            this.paginator.page,
            this.update,
            this.#delete$,
        )),
        startWith(null as any),
        map(_ => [
            (this.paginator?.pageIndex || 0),// * (this.paginator?.pageSize ?? 10),// startIndex
            this.paginator?.pageSize ?? 10,
            this.sort?.active ? this.sort?.active : 'id',
            this.sort?.direction ? this.sort?.direction : 'desc',
            this.cin.value === '' ? '*' : this.cin.value,
            this.balanceMin.value,
            this.balanceMax.value,
            this.userId.value,
        ]),
        tap(e => this.isLoadingResults = true),
        switchMap(e => this.uow.core.accounts.getList(e).pipe(
            tap(e => this.totalRecords = e.count),
            map(e => e.list),
            tap(list =>!this.userIdParams ? null : this.user.set((list.find(e => e.user_id === this.userIdParams) as any)?.user))
        )),
        tap(e => this.isLoadingResults = false),
    ), { initialValue: [] }) as any;

    ngAfterViewInit(): void {
        this.viewInitDone.next();
    }

    trackById(index: number, item: any): number {
        return item.id; // Assuming "id" is a unique identifier for each item
    }

    reset() {
        this.cin.setValue('');
        this.balanceMin.setValue(0);
        this.balanceMax.setValue(0);
        this.userId.setValue(0);

        this.update.next(0);
    }

    search() {
        this.update.next(0);
    }

    openDialog(o: Account, text) {
        const dialogRef = this.dialog.open(UpdateComponent, {
            // width: '1100px',
            disableClose: true,
            data: { model: o, title: text }
        });

        return dialogRef.afterClosed();
    };

    add() {

        this.openDialog({} as Account, 'Ajouter Account').subscribe(result => {
            if (result) {
                this.update.next(0);
            }
        });
    }

    edit(o: Account) {

        this.openDialog(o, 'Modifier Account').subscribe((result: Account) => {
            if (result) {
                this.update.next(0);
            }
        });
    }

    remove(o: Account) {
        this.delete$.next(o);
    }


}
