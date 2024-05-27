import { inject, Injectable } from '@angular/core';
import { User, Account } from 'app/core/api';
import { UowService } from 'app/core/http-services/uow.service';
import { shareReplay, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CachedService {

    readonly uow = inject(UowService);

    readonly users$ = this.uow.core.users.getWithAccounts().pipe(
        shareReplay(),
        map(e => e as (User & { accounts: Account[] })[]),
    );
}
