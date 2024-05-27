import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, forwardRef, inject, Input, OnDestroy, OnInit, Output, signal, TemplateRef, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NG_VALUE_ACCESSOR, FormControl, ControlValueAccessor, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UowService } from 'app/core/http-services/uow.service';
import { displayImageCore } from 'environments/environment.development';
import { catchError, delay, filter, from, map, of, Subject, Subscription, switchMap, tap } from 'rxjs';
import { MyImageComponent } from './display-image/my-image.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    standalone: true,
    selector: 'app-upload-file',
    templateUrl: './upload-file.component.html',
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MyImageComponent,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    providers: [
        DatePipe,
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => UploadFileComponent)
        },
    ]
})
export class UploadFileComponent implements OnInit, OnDestroy, ControlValueAccessor {
    private uow = inject(UowService)
    @Input() template: TemplateRef<any>;
    @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

    displayImage = displayImageCore;
    subs: Subscription[] = [];
    @Input() isImage = true;
    @Input() folder: string;
    @Input() isLoadingResults = false;
    @Input() placeholder = '';
    @Input() labelName='';

    @Output() uploaded = new EventEmitter<string>();
    readonly fileName = signal('');

    //
    readonly obj = new FormControl('', [Validators.required]);
    disabled = false;
    onChange = (obj) => {
    };
    onTouched = () => { };

    inputClick$ = new Subject<void>();
    #inputClick$ = toSignal(this.inputClick$.pipe(
        tap(_ => console.log('oh shit')),
        tap(_ => console.log(this.fileInput)),
        tap(_ => this.fileInput.nativeElement.click())
    ))

    readonly upload$ = new Subject<FileList>();
    readonly uploadPipe$ = toSignal(this.upload$.pipe(
        tap(_ => this.isLoadingResults = true),
        map(e => e.item(0)),
        switchMap(file => of(new FormData()).pipe(
            tap(formData => formData.append(`file`, file, file.name)),
            switchMap(formData => this.uow.files.uploadFiles(this.folder, formData).pipe(
                catchError(this.uow.handleError),
            )),
            filter(r => r.code > 0),
            switchMap(_ => this.handleFileInput(file)),
            tap(base64 => this.fileName.set(base64)),
            tap(_ => this.isLoadingResults = false),
            tap(_ => this.obj.setValue(`${this.folder}/${file.name}`, { emitEvent: true })),
            delay(50),
            tap(_ => this.uploaded.next(`${this.folder}/${file.name}`)),
        ))
    ))

    readonly remove$ = new Subject<void>();
    readonly delete$ = toSignal(this.remove$.pipe(
        switchMap(_ => this.uow.fuseConfirmation.open({ message: 'Are you sure to delete this picture?' }).afterClosed().pipe(
            filter((e: 'confirmed' | 'cancelled') => e === 'confirmed'),
            switchMap(_ => this.uow.files.deleteFile(this.folder, (this.obj.value as string).split('/')[1]).pipe(
                catchError(this.uow.handleError),
            )),
            tap(r => this.obj.setValue('')),
            tap(r => this.fileName.set('')),
        ))
    ));

    constructor() {
    }

    ngOnInit() {
        this.obj.valueChanges.subscribe(r => {
            setTimeout(() => {
                this.onTouched();
                this.onChange(r);
            }, 10);
        });
    }

    writeValue(obj: string): void {
        this.obj.setValue(obj, { emitEvent: false });

        this.fileName.set(displayImageCore(obj));
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    handleFileInput(file: File) {
        return from(new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.toString());
            reader.readAsDataURL(file);
        }));
    }

    async openInput(o/*: HTMLInputElement*/) {
        o.click();
    }

    ngOnDestroy(): void {
        this.subs.forEach(e => {
            e.unsubscribe();
        });
    }
}

