import { Component, ChangeDetectionStrategy, inject, ViewEncapsulation, signal } from '@angular/core';
import { Subject, delay, filter, map, switchMap, take, takeUntil, tap, catchError, of, concatMap, from, toArray, distinct, distinctUntilChanged } from 'rxjs';
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
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { UploadFileComponent } from '@fuse/upload-file/upload-file.component';
import moment from 'moment';

@Component({
    standalone: true,
    selector: 'app-job-add',
    templateUrl: './add.component.html',
    styles: [``],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    imports: [
        CommonModule,
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
export class AddComponent {
    //di
    readonly fb = inject(FormBuilder);
    readonly uow = inject(UowService);
    readonly dialogRef = inject(MatDialogRef);
    readonly data = inject(MAT_DIALOG_DATA);

    readonly myForm: FormGroup<TypeForm<any>> = this.fb.group({
        id: [0],
        configIds: [null, []],
    }) as any;

    // select
    readonly configs$ = this.uow.core.configs.getForSelect$;

    readonly showMessage$ = new Subject<any>();

    readonly result = new FormControl('')
    readonly startTime = signal(moment());
    readonly elapsedTime = signal(0);

    readonly post$ = new Subject<void>();
    readonly #post$ = toSignal(this.post$.pipe(
        map(_ => this.result.setValue('')),
        map(_ => this.result.disable()),
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        map(_ => this.myForm.getRawValue()),
        tap(_ => console.log('myForm', this.myForm.getRawValue())),
        filter(e => e.configIds?.length > 0),
        switchMap(o => this.uow.core.myScrapings.getProgress(o.configIds).pipe(
            distinctUntilChanged(),
            tap(phrase => this.result.setValue(`${this.result.value + phrase}\r\n`)),
            tap(phrase => {
                phrase.trim().includes('.done.') ? this.result.enable() : null;
                const currentTime = moment();

                this.elapsedTime.set(currentTime.diff(this.startTime(), 'seconds'));
                // Update UI or log with the elapsed time
                // console.log(`Elapsed Time: ${elapsedTime} ms`);
            }),
        )),
    ));

    submit = (e: Job) => this.post$.next();
    back = (e?: Job) => this.dialogRef.close(e);

    ngAfterViewInit(): void {
        // this.viewInitDone.next();
        // this.uow.core.myScrapings.getProgress([1, 2]).subscribe(r => {
        //     console.log(r);
        // });
    }
}
