import { Component, ChangeDetectionStrategy, inject, ViewEncapsulation } from '@angular/core';
import { Subject, delay, filter, map, switchMap, take, takeUntil, tap, catchError } from 'rxjs';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { fuseAnimations } from '@fuse/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UploadFileComponent } from '@fuse/upload-file/upload-file.component';
import { User } from 'app/core/api';
import { AccountComponent } from "../../account/account.component";

@Component({
    standalone: true,
    selector: 'app-user-update',
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
        RouterLink,
        FuseAlertComponent,
        UploadFileComponent,
    ]
})
export class UpdateComponent {
    //di
    readonly fb = inject(FormBuilder);
    readonly uow = inject(UowService);


    readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);

    readonly myForm: FormGroup<TypeForm<User>> = this.fb.group({
        id: [0],
        firstname: [null, [Validators.required]],
        lastname: [null, [Validators.required]],
        cin: [null, [Validators.required]],
        email: [null, [Validators.required, Validators.email]],
        password: [null, []],
        phone: [null, [Validators.required]],
        birthdate: [new Date(), [Validators.required]],
        avatar: [null, []],
        gender: [null, [Validators.required]],
        address: [null, [Validators.required]],
        active: [null, [Validators.required]],
        role_id: [0, [Validators.min(1),]],
    }) as any;

    // select
    readonly roles$ = this.uow.core.roles.get$;

    readonly showMessage$ = new Subject<any>();

    readonly post$ = new Subject<void>();
    readonly #post$ = toSignal(this.post$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),
        switchMap(o => this.uow.core.users.post(o).pipe(
            catchError(this.uow.handleError),
            map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
        )),
        tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
        filter(r => r.code === 1),
        delay(500),
        tap((r) => this.myForm.enable()),
        tap(r => this.back(r)),
    ));

    readonly put$ = new Subject<void>();
    readonly #put$ = toSignal(this.put$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),
        switchMap(o => this.uow.core.users.put(o.id, o).pipe(
            catchError(this.uow.handleError),
            map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
        )),
        tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
        filter(r => r.code === 1),
        delay(500),
        tap((r) => this.myForm.enable()),
        tap(r => this.back(r)),
    ));

    readonly model = toSignal(this.route.paramMap.pipe(
        take(1),
        map(e => +(e.get('id') ?? 0)),
        filter(id => id !== 0),
        switchMap(id => this.uow.core.users.getById(id)),
        tap(r => this.myForm.patchValue(r)),
    ));

    submit = (e: User) => e.id === 0 ? this.post$.next() : this.put$.next();
    back = (e?: User) => this.router.navigate(['../'], { relativeTo: this.route });
}
