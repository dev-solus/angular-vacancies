import { Component, ChangeDetectionStrategy, inject, ViewEncapsulation } from '@angular/core';
import { Subject, delay, filter, map, switchMap, take, takeUntil, tap, catchError, of } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl, FormArray } from '@angular/forms';
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
import { Config } from 'app/core/api';


@Component({
    standalone: true,
    selector: 'app-config-update',
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

    ],
})
export class UpdateComponent {
    //di
    readonly fb = inject(FormBuilder);
    readonly uow = inject(UowService);


    readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);

    readonly model = toSignal(this.route.paramMap.pipe(
        take(1),
        map(e => +(e.get('id') ?? 0)),
        delay(50),
        tap(id => this.myForm.patchValue(id === 0 ? init : {})),
        filter(id => id !== 0),
        switchMap(id => this.uow.core.configs.getById(id).pipe(
            tap(r => this.myForm.patchValue(r)),
            tap(e => {
                (this.myForm.controls.detail.get('metadata') as FormArray).clear();
                e.detail.metadata.forEach((m: any) => {
                    const metadataGroup = this.fb.group({
                        name: [m.name, Validators.required],
                        selector: [m.selector, Validators.required],
                        type: [m.type, Validators.required]
                    });
                    (this.myForm.controls.detail.get('metadata') as FormArray).push(metadataGroup);
                });
            }),
        )),
    ));


    // readonly myForm: FormGroup<TypeForm<Config>> = this.fb.group({
    //     id: [null, []],
    //     name: [null, []],
    //     url: [null, []],
    //     count: [null, []],
    //     pageSize: [0, [Validators.min(1),]],
    //     pageSelector: [null, []],
    //     home: [0, [Validators.min(1),]],
    //     detail: [0, [Validators.min(1),]],
    // }) as any;
    readonly homeFields = ['card', 'title', 'url'];
    readonly detailFields = ['title', 'image', 'date', 'location', 'domain', 'company', 'skills', 'educationLevel', 'contract', 'description'];


    readonly myForm: FormGroup<TypeForm<Config>> = this.fb.group({
        id: [null, []],
        name: ['', Validators.required],
        pageSize: ['', Validators.required],
        count: ['', Validators.required],
        pageSelector: ['', Validators.required],
        url: ['', Validators.required],
        home: this.fb.group({
            card: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
            title: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
            url: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
        }),
        detail: this.fb.group({
            title: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
            image: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
            date: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
            location: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
            description: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
            domain: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
            company: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
            skills: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
            educationLevel: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
            contract: this.fb.group({
                selector: ['', Validators.required],
                type: ['', Validators.required],
            }),
            metadata: this.fb.array([]) // You can push form groups to this form array later

        })
    }) as any;

    getMetadataControls() {
        return (this.myForm.get('detail.metadata') as FormArray).controls;
    }

    addMetadata() {
        const metadataArray = this.myForm.get('detail.metadata') as FormArray;
        const metadataGroup = this.fb.group({
            name: ['', Validators.required],
            selector: ['', Validators.required],
            type: ['', Validators.required]
        });
        metadataArray.push(metadataGroup);
    }

    readonly showMessage$ = new Subject<any>();

    readonly post$ = new Subject<void>();
    readonly #post$ = toSignal(this.post$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        // filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),
        switchMap(o => this.uow.core.configs.post(o).pipe(
            tap((r) => this.myForm.enable()),
            catchError(this.uow.handleError),
            map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
        )),
        tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
        filter(r => r.code === 1),
        delay(500),
        tap(r => this.back(r as any)),
    ));

    readonly put$ = new Subject<void>();
    readonly #put$ = toSignal(this.put$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        // filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),
        switchMap(o => this.uow.core.configs.patchObject(o.id, o).pipe(
            tap((r) => this.myForm.enable()),
            catchError(this.uow.handleError),
            map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
        )),
        tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
        filter(r => r.code === 1),
        delay(500),
        tap(r => this.back(r as any)),
    ));

    submit = (e: Config) => e.id === 0 ? this.post$.next() : this.put$.next();
    back = (e?: Config) => this.router.navigate(['../'], { relativeTo: this.route });
}

const init = {

} as Config;
