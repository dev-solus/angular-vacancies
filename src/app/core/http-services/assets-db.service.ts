import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, of, shareReplay } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AssetsDbService {
    #http = inject(HttpClient);
    // #all = this.#http.get<DataBase>('assets/json/db.json');
    #allS = of(JSON.parse(`
    {
        "stateProducts": [
            {"name": "n", "label": "neuf" , "color": "green"},
            {"name": "pn", "label": "presque neuf" , "color": "green"}
        ],
        "deliveries": [
            "Colissimo",
            "Chronopost",
            "Mondial Relay",
            "Relais Colis",
            "GLS",
            "DPD",
            "TNT"
        ]
    }
    `))
    public readonly all = this.#allS.pipe(shareReplay(1));
}

export class DataBase {
    stateProducts: {name: string, label: string, color: string}[] = [];
    deliveries: string[] = [];
}
