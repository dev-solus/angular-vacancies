import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { Config, CV, Section } from 'app/core/api';
import { UowService, TypeForm, TypeFormNew } from 'app/core/http-services/uow.service';
import { catchError, concatMap, delay, filter, from, map, of, Subject, switchMap, tap } from 'rxjs';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { EditorComponent } from 'app/core/editor/editor.component';
import { SanitizeHtml } from '@fuse/pipes/sanitize-html.pipe';

@Component({
    standalone: true,
    selector: 'app-cv',
    templateUrl: './cv.component.html',
    styles: [``],
    // changeDetection: ChangeDetectionStrategy.OnPush,
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
        FuseScrollResetDirective,
        MatExpansionModule,
        EditorComponent,
        SanitizeHtml,
    ],
})
export class CvComponent implements AfterViewInit {
    //di
    readonly fb = inject(FormBuilder);
    readonly uow = inject(UowService);
    readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);

    readonly user = this.uow.session.user;

    readonly myForm: TypeFormNew<CV> = this.fb.group({
        name: [''],
        sections: this.fb.array([]) // You can push form groups to this form array later
    }) as any;

    readonly model = toSignal(of(this.user()?.cv).pipe(
        delay(50),
        // tap(r => console.warn(r)),
        // filter(r => r !== null),
        // tap(r => this.myForm.setValue(r)),
        tap(e => {
            this.myForm.controls.sections.clear();
            e.sections.forEach(s => {
                this.myForm.controls.sections.push(this.fb.group({
                    title: [s.title],
                    details: [s.details],
                }) as any);
            });

            this.myForm.controls.name.setValue(e.name)

            // console.warn(this.myForm.controls.sections.controls)
        }),
    ));

    // get sectionControls() {
    //     return this.myForm.controls.sections.controls;
    // }

    // addSection() {
    //     const sectionArray = this.myForm.controls.sections;
    //     const sectionGroup: TypeFormNew<Section> = this.fb.group({
    //         title: [''],
    //         details: [''],
    //     }) as any;

    //     sectionArray.push(sectionGroup);
    // }

    // removeSection(index: number) {
    //     const sectionArray = this.myForm.controls.sections;
    //     sectionArray.removeAt(index);
    // }

    readonly showMessage$ = new Subject<any>();

    readonly jobId = +this.route.snapshot.paramMap.get('id');

    readonly put$ = new Subject<void>();
    readonly #put$ = toSignal(this.put$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),
        map(o => ({ id: this.user().id, cv: o })),
        switchMap(o => this.uow.core.users.patchObject(o.id, { cv: o.cv }).pipe(
            // tap((r) => this.myForm.enable()),
            catchError(this.uow.handleError),
            map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
            tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
            // filter(r => r.code === 1),
            delay(900),
            tap(r => /*r.code > 0 ?? */this.myForm.enable()),
            // tap(r => this.back()),
            tap(_ => this.uow.session.updateUser({ ...this.user(), cv: o.cv })),
        )),
    ));

    readonly cvAI = new FormControl('', Validators.required);

    readonly res = signal('')

    readonly generateCvAI$ = new Subject<void>();
    readonly streamAI = this.generateCvAI$.pipe(
        switchMap(_ => this.uow.core.gemini.generateCV(this.jobId).pipe(
            concatMap((phrase: any) => from(phrase).pipe(
                // concatMap(char => of(char).pipe(
                delay(90),
                // map(e => this.cvAI.value.concat(e.toString())),
                tap(e => this.res.update(c => c + e)),
                // tap(e => console.log(this.res())),
                map(_ => this.res()),
                tap(e => this.cvAI.setValue(e)),
                // )),
            )),
        ))
    );

    readonly saveCvAI$ = new Subject<void>();
    readonly #saveCvAI$ = toSignal(this.saveCvAI$.pipe(
        tap(_ => this.cvAI.markAllAsTouched()),
        filter(_ => this.cvAI.valid && this.cvAI.dirty),
        tap(_ => this.cvAI.disable()),
        map(_ => this.cvAI.getRawValue()),
        map(o => ({ id: this.user().id, cv: o })),
        switchMap(o => this.uow.core.submissions.patchObject(o.id, { cv: o.cv }).pipe(
            // tap((r) => this.cvAI.enable()),
            catchError(this.uow.handleError),
            map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
            tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
            // filter(r => r.code === 1),
            delay(900),
            tap(r => /*r.code > 0 ?? */this.cvAI.enable()),
            // tap(r => this.back()),
            // tap(_ => this.uow.session.updateUser({ ...this.user(), cv: o.cv })),
        )),
    ));

    submit = (e: Config) => this.put$.next();
    back = () => {
        const title = this.route.snapshot.paramMap.get('title');
        const id = this.route.snapshot.paramMap.get('id');

        // console.log(title, id);

        this.router.navigate(['', title, id], { queryParams: { id } });
    };

    ngAfterViewInit(): void {
        // this.uow.core.gemini.test2().subscribe(r => {
        //     console.log(r);
        // });
    }
}
