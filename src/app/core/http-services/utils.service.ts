import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { SuperService } from './super.service';
import { displayImageCore } from 'environments/environment.development';


@Injectable({
    providedIn: 'root'
})
export class UtilsService {
    http = inject(HttpClient);
    constructor() { }

    extendClass<C, T >(baseClass: any, apiUrl: string, controllers: string): T & SuperService<C> {
        // const controllers = baseClass.name.replace('Service', '');

        const instance: T = new (baseClass as new (...args: any[]) => any)(this.http, apiUrl, null);

        Object.assign(instance, { ...(new SuperService<C>(controllers, `${apiUrl}/api`)) })

        return instance as any;
    }
    // extendServiceWithSuperService<T, S>(service: new (...args: any[]) => T, apiUrl: string, controllers: string): T & SuperService<S> {
    //     const instance: T & SuperService<S> = new service(this.http, apiUrl, null);

    //     Object.assign(instance, { ...(new SuperService<S>(controllers, `${apiUrl}/api`)) });

    //     return instance;
    // }
    async test(url) {
        const r = await lastValueFrom(this.http.get(displayImageCore(url), { responseType: 'blob' }))
        return await this.blobToBase64(r);
    }

    blobToBase64(blob) {
        return new Promise<string>((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as any);
            reader.readAsDataURL(blob);
        });
    }


    async toBase64(url) {
        const img = new Image(50, 50);
        img.src = displayImageCore(url);
        // img.crossOrigin="anonymous";
        img.setAttribute('crossorigin', 'anonymous'); // works for me

        // img.style.margin = '50px'

        return new Promise<string>((r, _) => {
            const maxW = 300;
            const maxH = 300;
            img.onload = function () {
                const canvas = document.createElement("canvas");
                const iw = img.width;
                const ih = img.height;
                const scale = Math.min((maxW / iw), (maxH / ih));
                const iwScaled = iw * scale;
                const ihScaled = ih * scale;
                canvas.width = iwScaled;
                canvas.height = ihScaled;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, iwScaled, ihScaled);

                const dataURL = canvas.toDataURL("image/png");

                r(dataURL);
            };
        })
    }
}
