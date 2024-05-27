import { startWith } from 'rxjs/operators';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { of, Subject, switchMap, map, shareReplay } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, OnInit, Input, forwardRef, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { displayImageCore, environment } from 'environments/environment.development';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UowService } from 'app/core/http-services/uow.service';
import { forEach } from 'lodash';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-upload-fa-image',
    template: `
    <ng-container *ngIf="dataSource$ | async as dataSource">
        <div class="flex mb-3 items-center" >
            <input hidden [multiple]="multiple" accept="image/*" #file1 type="file" (change)="upload($any($event.target).files)">

            <div class="border-dashed border-2 border-sky-500 bg-slate-200">
                <mat-radio-group aria-label="Select an option" >
                    <div class="flex flex-wrap w-full">
                        <ng-container *ngFor="let e of dataSource; let i=index">

                            <div *ngIf="e.deleted === false" class="relative">

                                <!-- {{e.image}} -->
                                <img [alt]="e.image"  [src]="displayImage(e.path)" onerror="src='assets/404.png'" style="width: 170px; height: 170px;">
                                <!-- delete btn -->

                                <div class="absolute top-0 right-0 flex justify-center items-center">
                                    <button mat-icon-button color="warn" (click)="remove(i)" type="button">
                                        <mat-icon svgIcon="heroicons_outline:trash"></mat-icon>
                                    </button>

                                    <!-- <mat-radio-button color="accent" [checked]="e.default ?? false" (change)="change($event, i);" [value]="i"></mat-radio-button> -->
                                </div>
                                <mat-progress-bar *ngIf="loader !== 0" mode="determinate" [value]="loader"></mat-progress-bar>
                            </div>
                        </ng-container>

                        <div class="flex items-center justify-center" style="width: 170px; height: 170px;" *ngIf="showAddImageCondition">
                            <button mat-mini-fab color="none" [disabled]="disabled" (click)="openInput(file1)">
                                <mat-icon svgIcon="heroicons_outline:cloud-arrow-up"></mat-icon>
                            </button>
                        </div>
                    </div>
                </mat-radio-group>
            </div>
        </div>

    </ng-container>
    `,
    styles: [`
        img {
            height: 20px;
        }
    `],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => UploadImageFaComponent)
        },
    ],
    imports: [
        CommonModule,
        MatIconModule,
        MatProgressBarModule,
        MatButtonModule,
        MatRadioModule,
    ]
})
export class UploadImageFaComponent implements ControlValueAccessor {
    displayImage = displayImageCore;
    public images: IImage[] = [];
    // private obj = new FormControl<IImage[]>([]);
    readonly imageSubject = new Subject<boolean>();

    readonly dataSource$ = this.imageSubject.asObservable().pipe(
        startWith(null),
        switchMap(e => of(this.images).pipe(
            map(images => {
                // if (images.filter(e => e.deleted === false)?.some(e => e.default === true) === false) {
                //     images.filter((_, i) => i === 0).forEach(e => e.default = true);
                // }

                // this.obj.setValue(images.filter(m => m.deleted === false), { emitEvent: true });

                 console.log(images);

                this.onTouched();
                this.onChange(images);

                return images;
            })
        )),
        shareReplay(1)
    )

    @Input({required: true}) folder : string;
    @Input() multiple = true;
    @Input() disabled = false;
    @Input() setDefault = false;

    loader = 0;
    onChange = (obj: IImage[]) => { };
    onTouched = () => { };

    change(e: MatRadioChange, index: number) {
        this.images.forEach(o => o.default = false);
        this.images.filter((_, i) => i === index).forEach(o => o.default = true);

        this.imageSubject.next(true);
    }

    writeValue(obj: IImage[]): void {
        if (obj === null) {
            return;
        }
        console.dir(obj);
        if (typeof obj === 'string') {
            this.images.push(...(obj as any).split(';').map(e => this.toIImage(e)));
        } else {
            this.images.push(...obj)
        }

        this.imageSubject.next(true);
    }

    toIImage(obj: string): IImage {
        return {
            id: 0,
            name: obj.split('/').pop(),
            label: obj.split('/').pop(),
            image: obj,
            deleted: false,
            default: false,
            size: 0,
            extension: obj.split('.').pop(),
            type: obj.split('.').pop(),
            folder : this.folder,
            path : obj,
        }
    }


    async upload(fileList: FileList) {
        this.loader = 0;
        for (const file of Array.from(fileList)) {
            const blobString = await this.handleFileInputPromise(file);

            const compressedFile = await compressImage(file, 800, 600, 0.8);

            this.images.push({
                id: 0,
                name: file.name,
                label: file.name,
                image: blobString,
                file: file,
                deleted: false,
                default: false,
                size: file.size,
                extension: file.name.split('.').pop(),
                type: file.type,
                folder : this.folder,
                path : this.folder + '/' + file.name,
            });

            forEach(this.images, (e, i) => {
                let formData = new FormData();
                 formData.append(`file`, e.file);
                // this.uow.files.uploadFiles(this.folder, formData).subscribe(r => {})

            })


            this.imageSubject.next(true)
        }
    }

    get showAddImageCondition() {
        return this.multiple ? true : this.images.filter(e => e.deleted === false).length === 0;
    }

    remove(index: number) {
        this.images.filter((_, i) => i === index).forEach(e => e.deleted = true)

        this.imageSubject.next(true)
    }

    openInput(o/*: HTMLInputElement*/) {
        o.click();
    }

    handleFileInputPromise(file: File) {
        return new Promise<string>((res, _) => {
            const reader = new FileReader();

            reader.onload = () => res(reader.result.toString());

            reader.readAsDataURL(file);
        })
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
}

export interface IImage {
    id?: number;
    name?: string;
    label?: string;
    image?: string;
    file?: File | Blob;
    deleted?: boolean;
    type?: string;
    extension?: string;
    size?: number;
    default?: boolean;
    folder?: string;
    path?: string;
}

function compressImage(file, maxWidth, maxHeight, quality) {
    return new Promise<Blob>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
        const image = new Image();
        image.src = event.target.result as string;
        image.onload = () => {
          const canvas = document.createElement('canvas');
          let width = image.width;
          let height = image.height;
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, width, height);
          canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
        };
        image.onerror = error => reject(error);
      };
      reader.onerror = error => reject(error);
    });
  }

