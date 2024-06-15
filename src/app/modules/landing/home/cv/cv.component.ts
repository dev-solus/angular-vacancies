import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { Config, CV, Section } from 'app/core/api';
import { UowService, TypeForm, TypeFormNew } from 'app/core/http-services/uow.service';
import { catchError, delay, filter, map, of, Subject, switchMap, tap } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-cv',
    templateUrl: './cv.component.html',
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
export class CvComponent {
    //di
    readonly fb = inject(FormBuilder);
    readonly uow = inject(UowService);
    readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);

    readonly user = this.uow.session.user;

    readonly myForm: TypeFormNew<CV> = this.fb.group({
        name: ['', Validators.required],
        sections: this.fb.array([]) // You can push form groups to this form array later
    }) as any;

    readonly model = toSignal( of(this.user()?.cv).pipe(
        delay(50),
        tap(r => console.warn(r)),
        // filter(r => r !== null),
        // tap(r => this.myForm.setValue(r)),
        tap(e => {
            this.myForm.controls.sections.clear();
            e.sections.forEach(s => {
                this.myForm.controls.sections.push(this.fb.group({
                    title: [s.title, Validators.required],
                    details: [s.details, Validators.required],
                }) as any);
            });

            this.myForm.controls.name.setValue(e.name)

            console.warn(this.myForm.controls.sections.controls)
        }),
    ));

    get sectionControls() {
        return this.myForm.controls.sections.controls;
    }

    addSection() {
        const sectionArray = this.myForm.controls.sections;
        const sectionGroup: TypeFormNew<Section> = this.fb.group({
            title: ['', Validators.required],
            details: ['', Validators.required],
        }) as any;

        sectionArray.push(sectionGroup);
    }

    removeSection(index: number) {
        const sectionArray = this.myForm.controls.sections;
        sectionArray.removeAt(index);
    }

    readonly showMessage$ = new Subject<any>();

    readonly put$ = new Subject<void>();
    readonly #put$ = toSignal(this.put$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        // filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),
        map(o => ({ id: this.user().id, cv: o})),
        switchMap(o => this.uow.core.users.patchObject(o.id, o).pipe(
            tap((r) => this.myForm.enable()),
            catchError(this.uow.handleError),
            map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
        )),
        tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
        filter(r => r.code === 1),
        delay(500),
        tap(r => this.back(r as any)),
    ));

    submit = (e: Config) => this.put$.next();
    back = (e?: Config) => this.router.navigate(['../'], { relativeTo: this.route });
}
