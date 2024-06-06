import { Component, ChangeDetectionStrategy, inject, ViewEncapsulation } from '@angular/core';
import { Subject, delay, filter, map, switchMap, take, takeUntil, tap, catchError, of } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Job } from 'app/core/api';
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

@Component({
    standalone: true,
    selector: 'app-job-update',
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
    ],
})
export class UpdateComponent {
    //di
    readonly fb = inject(FormBuilder);
    readonly uow = inject(UowService);


    readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);

    readonly myForm: FormGroup<TypeForm<Job>> = this.fb.group({
        id: [0],
        title: [null, []],
        url: [null, []],
        image: [null, []],
        date: [null, []],
        location: [null, []],
        description: [null, []],
        domain: [null, []],
        company: [null, []],
        fonction: [null, []],
        educationLevel: [null, []],
        salary: [null, []],
        metadataId: [0, [Validators.min(1),]],
    }) as any;

    readonly showMessage$ = new Subject<any>();

    readonly put$ = new Subject<void>();
    readonly #put$ = toSignal(this.put$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),
        switchMap(o => this.uow.core.jobs.patchObject(o.id, o).pipe(
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
        switchMap(id => this.uow.core.jobs.getById(id)),
        tap(r => this.myForm.patchValue(r)),
    ));

    submit = (e: Job) => this.put$.next();
    back = (e?: Job) => this.router.navigate(['../'], { relativeTo: this.route });
}
