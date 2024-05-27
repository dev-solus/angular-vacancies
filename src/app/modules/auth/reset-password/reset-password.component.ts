import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { UowService, TypeForm } from 'app/core/http-services/uow.service';
import { Subject, catchError, delay, filter, finalize, map, switchMap, take, tap } from 'rxjs';
import { MyImageComponent } from "@fuse/upload-file/display-image/my-image.component";

@Component({
    selector: 'auth-reset-password',
    templateUrl: './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [NgIf,
        AsyncPipe,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterLink, MyImageComponent]
})
export class AuthResetPasswordComponent {
    private readonly fb = inject(FormBuilder);
    private readonly uow = inject(UowService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    // Validators.minLength(8),Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/)

    readonly myForm: FormGroup<TypeForm<{ password: string, passwordConfirm: string }>> = this.fb.group({
        password: [this.uow.isDev ? '1234' : '', [Validators.required]],
        passwordConfirm: [this.uow.isDev ? '1234' : '', [Validators.required]]
    },
        {
            validators: FuseValidators.mustMatch('password', 'passwordConfirm')
        }
    );

    readonly token = toSignal(this.route.paramMap.pipe(
        take(1),
        map(e => e.get('token')),
        // tap(r => !r ? this.showMessage.next({ code: -1, message: "le format du jeton n'est pas correct" }) : null),
        // delay(2500),
        // tap(r => this.router.navigate(['/sign-in'])),
    ), { initialValue: '' });

    readonly submitAction = new Subject<void>();
    readonly submit$ = toSignal(this.submitAction.pipe(
        filter(e => {
            console.warn(this.token());
            return !!this.token();
        }),
        tap(e => this.uow.logInvalidFields(this.myForm)),
        filter(e => this.myForm.valid),
        tap(e => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),

        map(o => ({ token: this.token(), model: { password: o.password } })),
        switchMap(e => this.uow.core.auth.resetPassword(e.token, e.model).pipe(
            catchError(this.uow.handleError),
        )),
        tap(r => this.showMessage.next(r)),
        // tap(r => console.warn(r.token)),
        tap((r:any) => r.code < 0 ? this.myForm.enable() : null),
        // tap(r => this.myForm.reset()),
        filter(r => r.code > 0),
        delay(2500),
        tap(r => this.router.navigate(['/sign-in'])),
    ));

    private readonly showMessage = new Subject<any>();

    readonly message$ = this.showMessage.pipe(
        tap(e => console.warn(e))
    )

    constructor() { }

    submit(e) {
        this.submitAction.next(e)
    }
}
