import { Component, ChangeDetectionStrategy, inject, ViewEncapsulation } from '@angular/core';
import { Subject, delay, filter, map, switchMap, take, takeUntil, tap, catchError, of } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UowService, TypeForm } from 'app/core/http-services/uow.service';
import { FuseAlertComponent } from '@fuse/components/alert';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
import { fuseAnimations } from '@fuse/animations';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { FuseValidators } from '@fuse/validators';

@Component({
    standalone: true,
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styles: [``],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        FuseAlertComponent,
    ],
})
export class ResetPasswordComponent {
    //di
    readonly fb = inject(FormBuilder);
    readonly uow = inject(UowService);
    readonly dialogRef = inject(MatDialogRef);
    readonly data = inject(MAT_DIALOG_DATA);

    readonly myForm: FormGroup<TypeForm<{ password: string, passwordConfirm: string }>> = this.fb.group({
        password: [this.uow.isDev ? '' : '', [Validators.required]],
        passwordConfirm: [this.uow.isDev ? '' : '', [Validators.required]]
    },
        {
            validators: FuseValidators.mustMatch('password', 'passwordConfirm')
        }
    );

    readonly showMessage$ = new Subject<any>();

    readonly patch$ = new Subject<void>();
    readonly #patch$ = toSignal(this.patch$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => ({ password: this.myForm.controls.password.value })),
        // switchMap(o => this.uow.core.users.patchObject(this.data.model.id, o).pipe(
        switchMap(o => this.uow.core.auth.changePassword({ id: this.data.model.id, password: o.password }).pipe(
            catchError(this.uow.handleError),
            map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
        )),
        tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
        tap((r) => this.myForm.enable()),
        filter(r => r.code === 1),
        delay(500),
        tap(e => this.dialogRef.close(e)),
    ));

}
