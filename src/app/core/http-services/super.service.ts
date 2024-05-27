import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from 'environments/environment.development';
import { of, Observable, shareReplay } from 'rxjs';

export class SuperService<T> {
    protected http = inject(HttpClient);

    constructor(public controller: string, public apiUrl = environment.apiUrl) { }

    getList = (args: any[]) => this.http.get<{ list: T[], count: number }>(`${this.apiUrl}/${this.controller}/getAll/${args.join('/')}`);

    private getListCache$: Observable<{ list: T[]; count: number; }>;

    getList$ = (args: any[]) => {
        const refresh = false;

        if (!this.getListCache$ || refresh) {
            this.getListCache$ = this.getList(args).pipe(shareReplay(1));
        }

        return this.getListCache$;
    }

    get = () => this.http.get<T[]>(`${this.apiUrl}/${this.controller}/get`);

    getForSelect = () => this.http.get<(T & { id: number, name: string })[]>(`${this.apiUrl}/${this.controller}/getForSelect`);

    get$ = this.get().pipe(
        shareReplay(1)
    );

    getForSelect$ = this.getForSelect().pipe(
        shareReplay(1)
    );

    count = () => this.http.get<number>(`${this.apiUrl}/${this.controller}/count`);

    getById = (id) => this.http.get<T>(`${this.apiUrl}/${this.controller}/getById/${id}`);

    post = (o: T) => this.http.post<T>(`${this.apiUrl}/${this.controller}/add`, o);

    put = (id: number | string, o: T) => this.http.put<null>(`${this.apiUrl}/${this.controller}/update/${id}`, o);

    /**
     * Exemple
     * const model = [ { op: "replace", path: "/email", value: obj.email }];
     */
    patch = (id: number, model: { op: string, path: string, value: any }[]) => this.http.patch<T>(`${this.apiUrl}/${this.controller}/patch/${id}`, model);

    patchObject = (id: number, o: T, isAdd = false) => {
        const model = Object.keys(o).map(key => ({ op: isAdd ? 'add' : "replace", path: `/${key}`, value: o[key] }));
        return this.patch(id, model);
    };

    delete = (id) => this.http.delete<boolean>(`${this.apiUrl}/${this.controller}/delete/${id}`);

    updateRange(o: T[]) {
        return this.http.post(`${this.apiUrl}/${this.controller}/updateRange`, o);
    }

    deleteRange = (o: T[]) => this.http.post(`${this.apiUrl}/${this.controller}/deleteRange`, o);


    deleteRangeByIds = (ids: number[]) => {
        return this.http.post<number>(`${this.apiUrl}/${this.controller}/deleteRangeByIds`, ids);
    }

    postRange = (o: T[]) => this.http.post<{ id: number }[]>(`${this.apiUrl}/${this.controller}/addRange`, o);

    autocomplete(name: string, value: string): Observable<{ id: number, name: string }[]> {
        if (!name || !value) {
            return of([]);
        }
        return this.http.get(`${this.apiUrl}/${this.controller}/autocomplete/${name}/${value}`) as any;
    }

    getByForeign(id) {
        return this.http.get<T[]>(`${this.apiUrl}/${this.controller}/getByForeign/${id}`);
    }
}

