import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { CoreService } from "./core.service";
import { environment } from "environments/environment.development";
import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";
import { LocalService } from "../user/local.service";
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { AssetsDbService } from './assets-db.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Title, Meta } from '@angular/platform-browser';
import { SnackService } from '@fuse/services/snack/snack.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of, switchMap, take, tap } from 'rxjs';
import { UtilsService } from "./utils.service";
import { FileUploadService } from './file.upload.service';

@Injectable({
    providedIn: 'root'
})
export class UowService {
    readonly utils = inject(UtilsService)
    readonly session = inject(LocalService);

    readonly core = inject(CoreService);
    readonly assetsDb = inject(AssetsDbService);

    readonly files = inject(FileUploadService);

    readonly fuseConfirmation = inject(FuseConfirmationService);
    readonly isDev = !environment.production;
    readonly isServer = isPlatformServer(this.platformId);
    readonly isBrowser = isPlatformBrowser(this.platformId);
    readonly title = inject(Title);
    readonly meta = inject(Meta);
    // readonly snackBar = inject(MatSnackBar);
    readonly snack = inject(SnackService);


    constructor(@Inject(PLATFORM_ID) private platformId: any) { }

    snackAdd(message = 'Enregistré avec succès') {
        const config = {
            panelClass: ['green-snackbar'],
            duration: 2000
        };

        this.snack.open(message, null, config);
    }

    snackUpdate(message = 'Enregistré avec succès') {
        const config = {
            panelClass: ['green-snackbar'],
            duration: 2000
        };

        this.snack.open(message, null, config);
    }

    snackDelete(message = 'Enregistré avec succès') {
        const config = {
            panelClass: ['green-snackbar'],
            duration: 2000
        };

        this.snack.open(message, null, config);
    }



    get history() {
        return this.isServer ? { state: {} } : window.history;
    }

    seo = (e: { title: string, description: string, image: string }) => {
        this.title.setTitle(e.title);

        this.meta.updateTag({ name: 'title', content: e.title });
        this.meta.updateTag({ property: 'og:title', content: e.title });
        this.meta.updateTag({ name: 'twitter:title', content: e.title });

        this.meta.updateTag({ name: 'description', content: e.description });
        this.meta.updateTag({ property: 'og:description', content: e.description });
        this.meta.updateTag({ name: 'twitter:description', content: e.description });

        this.meta.updateTag({ property: 'og:image', content: e.image });
        this.meta.updateTag({ name: 'twitter:image', content: e.image });

        this.meta.updateTag({ property: 'og:url', content: environment.url });
        this.meta.updateTag({ name: 'robots', content: 'follow' });
    }

    // snackToast(message = 'Success') {
    //   this.snackBar.open(message, null, {
    //     duration: 5000,
    //     // horizontalPosition: 'right',
    //     // verticalPosition: 'top',
    //   });
    // }

    logInvalidFields = (form: FormGroup) => console.warn(Object.entries(form.controls).filter(([key, e]) => e.invalid).map(([key, e]) => ({ name: key, status: e.valid })));

    handleError = <T>(e: HttpErrorResponse, source: Observable<T>) => of({ code: -10, message: `${e.status} : ${e.message}` }).pipe(
        tap(_ => console.dir(e)),
        take(1),
        tap(e => this.snack.open(e.message)),
        map(e => e as T & { code: number, message: string }),
        // switchMap(_ => source),
    );

    jsonParse<T>(e: string) {
        try {
            return JSON.parse(e) as T;
        } catch (error) {
            return null;
        }
    }
}

export type TypeForm<T> = {
    [Property in keyof T]: FormControl<T[Property]>;
    // [K in keyof T]: T[K] extends FormControl<infer U> ? U : T[K]
};

export type TypeFormNew<T> = FormGroup<{
    [Property in keyof T]: T[Property] extends any[] ? FormArray<TypeFormNew<T[Property][0]>> : FormControl<T[Property]>;
}>;

export type TypeFormOld<T> = {
    [Property in keyof T]: FormControl<T[Property]>;
};

export type TypeFormA<T> = {
    [Property in keyof T]: AbstractControl<T[Property]>;
    // [K in keyof T]: T[K] extends FormControl<infer U> ? U : T[K]
};



export type TypeFormA2<T> = FormArray<FormGroup<{
    [Property in keyof T]: FormControl<T[Property]>;
}>>
