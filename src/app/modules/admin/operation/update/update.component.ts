import { Component, ChangeDetectionStrategy, inject, ViewEncapsulation, signal } from '@angular/core';
import { Subject, delay, filter, map, switchMap, take, takeUntil, tap, catchError, of, shareReplay } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Account, Operation, User } from 'app/core/api';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UowService, TypeForm } from 'app/core/http-services/uow.service';
import { FuseAlertComponent } from '@fuse/components/alert';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { fuseAnimations } from '@fuse/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CachedService } from '../cached.service';

@Component({
    standalone: true,
    selector: 'app-operation-update',
    templateUrl: './update.component.html',
    styles: [``],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        FuseAlertComponent,
    ],
})
export class UpdateComponent {
    //di
    readonly fb = inject(FormBuilder);
    readonly uow = inject(UowService);
    readonly cached = inject(CachedService);
    readonly dialogRef = inject(MatDialogRef);
    readonly data: { model: Operation } = inject(MAT_DIALOG_DATA);

    readonly patchForm = toSignal(of(this.data).pipe(
        delay(10),
        tap(e => this.myForm.patchValue(e.model)),
    ));

    readonly isAdmin = this.uow.session.isAdmin;

    readonly myForm: FormGroup<TypeForm<Operation>> = this.fb.group({
        id: [0],
        operationType: [null, []],
        description: [null, []],
        amount: [0, [Validators.min(1),], this.checkAsyncValidator.bind(this)],
        date: [new Date(), []],
        accountDebit_id: [0, [Validators.min(1),]],
        accountCredit_id: [0, [Validators.min(1),]],
    }) as any;

    // select
    readonly usersDebite$ = this.cached.users$.pipe(
        map(list => {
            if (this.isAdmin()) {
                return list;
            }

            return list.filter(e => e.id === this.uow.session.user().id);
        })
    );
    readonly usersCredit$ = this.cached.users$;

    readonly showMessage$ = new Subject<any>();

    readonly selectedAccount = signal({ balance: 0, id: 0 });

    readonly post$ = new Subject<void>();
    readonly #post$ = toSignal(this.post$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),
        switchMap(o => this.uow.core.operations.post(o).pipe(
            catchError(this.uow.handleError),
            map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
        )),
        tap((r) => this.myForm.enable()),
        tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
        filter(r => r.code === 1),
        delay(500),
        tap(r => this.back(r)),
    ));

    readonly put$ = new Subject<void>();
    readonly #put$ = toSignal(this.put$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),
        switchMap(o => this.uow.core.operations.put(o.id, o).pipe(
            catchError(this.uow.handleError),
            map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
        )),
        tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
        tap((r) => this.myForm.enable()),
        filter(r => r.code === 1),
        delay(500),
        tap(r => this.back(r)),
    ));

    // get amountBiggerThanBalance() {
    //     console.log(this.selectedAccount().balance, +this.myForm.controls.amount.value, +this.myForm.controls.id.value === 0);

    //     // if (this.selectedAccount().balance === 0) {
    //     //     return false;
    //     // }

    //     if (+this.myForm.controls.id.value === 0) {
    //         return +this.selectedAccount().balance < +this.myForm.controls.amount.value;
    //     }

    //     console.log((+this.selectedAccount().balance + +this.data.model.amount) < +this.myForm.controls.amount.value);
    //     console.error(+this.selectedAccount().balance, +this.data.model.amount, +this.myForm.controls.amount.value);


    //     return (+this.selectedAccount().balance + +this.data.model.amount) < +this.myForm.controls.amount.value;
    // }

    checkAsyncValidator(control: FormControl) {
        return of(control.value).pipe(
            delay(10), // Simulate an async validation process with a delay
            map(value => {
                let b = false;
                if (!+this.myForm.controls.id.value) {
                    b = +this.selectedAccount().balance < +value;
                } else {
                    b = (+this.selectedAccount().balance + +this.data.model.amount) < +value;
                }

                return b ? { 'amountBiggerThanBalance': true } : null;
            })
        );
    }

    submit = (e: Operation) => e.id === 0 ? this.post$.next() : this.put$.next();
    back = (e?: Operation) => this.dialogRef.close(e);
}
