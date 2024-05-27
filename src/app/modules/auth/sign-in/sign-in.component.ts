import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Component, ViewEncapsulation, inject } from '@angular/core';
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
import { FuseConfigService } from '@fuse/services/config';
import { UowService, TypeForm } from 'app/core/http-services/uow.service';
import { Subject, tap, filter, map, switchMap, catchError, delay, from, of } from 'rxjs';
import { MyImageComponent } from "@fuse/upload-file/display-image/my-image.component";
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
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
export class AuthSignInComponent {

    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    public uow = inject(UowService);

    readonly users = [
        { email: 'mourabit@gmail.com', password: '123', role: 'Client' },
        { email: 'agent@bank.com', password: '123', role: 'Agent' },
    ]

    readonly myForm: FormGroup<TypeForm<{ email: string, password: string }>> = this.fb.group({
        email: [this.uow.isDev ? 'agent@bank.com' : '', [Validators.required]],
        password: [this.uow.isDev ? '123' : '', Validators.required],
    }) as any;

    readonly signin = new Subject<void>();
    readonly signin$ = toSignal(this.signin.pipe(
        tap(e =>  this.uow.logInvalidFields(this.myForm) ),
        tap(_ => this.myForm.markAllAsTouched()),
        filter(e => this.myForm.valid),
        tap(e => this.myForm.disable()),
        tap(e => this.uow.session.token = ''),
        map(_ => this.myForm.getRawValue()),
        switchMap(o => this.uow.core.auth.login(o).pipe(
            catchError(this.uow.handleError),
        )),
        tap(e => console.warn(e)),
        tap(r => this.showMessage.next(r)),
        delay(1300),
        tap((r) => this.myForm.enable()),
        filter(r => r.code > 0),
        ///tap(r => this.uow.session.login(r.user, r.token)),
        tap(r => this.uow.session.login(r.user, r.token)),
        tap(r => this.router.navigateByUrl((this.route.snapshot.queryParamMap.get('redirectURL') || '/admin') )),
        // map(r => r.user.roleId === 1),
        // tap(isAdmin => {

        //     const redirectURL = this.route.snapshot.queryParamMap.get('redirectURL') || isAdmin ? '/admin' : '';

        //     this.router.navigateByUrl(redirectURL);
        // }),
    ));
    readonly showMessage = new Subject<any>();
}
