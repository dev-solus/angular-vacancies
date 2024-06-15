import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { UowService, TypeForm } from 'app/core/http-services/uow.service';
import { Subject, tap, filter, map, switchMap, catchError, delay, from, of, startWith } from 'rxjs';
import { MyImageComponent } from "@fuse/upload-file/display-image/my-image.component";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'app/core/api';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './login.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [RouterLink,
        FuseAlertComponent,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule, MyImageComponent]
})
export class LoginComponent {

    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    public uow = inject(UowService);

    readonly dialogRef = inject(MatDialogRef);
    readonly data = inject(MAT_DIALOG_DATA);

    readonly myForm: FormGroup<TypeForm<User>> = this.fb.group({
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
        email: [this.uow.isDev ? 'app@admin.com' : '', [Validators.required, Validators.email]],
        password: [this.uow.isDev ? '123' : '', Validators.required],
    }) as any;

    readonly showLogin$ = new Subject<boolean>();
    readonly showLogin = toSignal( this.showLogin$.pipe(
        delay(50),
        startWith(true),
        tap(showLogin => {
            if (!showLogin) {
                this.myForm.controls.firstname.setValidators([Validators.required]);
                this.myForm.controls.lastname.setValidators([Validators.required]);
            }
            else {
                this.myForm.controls.firstname.clearValidators();
                this.myForm.controls.lastname.clearValidators();
            }

            this.myForm.updateValueAndValidity();
        })
    ), {initialValue: true});

    readonly submit = new Subject<string>();
    readonly submit$ = toSignal(this.submit.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        filter(_ => this.myForm.valid),
        tap(_ => this.myForm.disable()),
        tap(_ => this.uow.session.token = ''),
        map(action => ({payload: this.myForm.getRawValue(), action})),
        switchMap(o => (
            o.action === 'login' ? this.uow.core.auth.apiAccountsLoginPost(o.payload) : this.uow.core.auth.apiAccountsRegisterPost(o.payload)
        ).pipe(
            catchError(this.uow.handleError),
        )),
        tap(e => console.warn(e)),
        tap(r => this.showMessage.next(r)),
        delay(2000),
        tap((r) => r.code > 0 || this.myForm.enable()),
        filter(r => r.code > 0),
        ///tap(r => this.uow.session.login(r.user, r.token)),
        tap(r => this.uow.session.login(r.user, r.token)),
        // tap(r => this.router.navigateByUrl((this.route.snapshot.queryParamMap.get('redirectURL') || ''))),
        //  map(r => r.user.roleId === 1),
        tap(r => {
            const isAdmin = r.user.roleId === 1;
            const redirectURL = this.route.snapshot.queryParamMap.get('redirectURL') || isAdmin ? '/admin' : '';

            this.router.navigateByUrl(redirectURL);
        }),
        // close the dialog
        tap(_ => this.dialogRef.close()),
    ));

    readonly showMessage = new Subject<any>();
}
