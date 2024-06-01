import { environment } from 'environments/environment.development';
import { Injectable, inject } from '@angular/core';
import { UtilsService } from './utils.service';
import { AccountsService, Config, ConfigsService, Role, RolesService, User, UsersService } from '../api';



@Injectable({
    providedIn: 'root'
})
export class CoreService {
    readonly utils = inject(UtilsService);

    readonly auth = this.utils.extendClass<User, AccountsService>(AccountsService, environment.apiUrl, 'Accounts');

    readonly users = this.utils.extendClass<User, UsersService>(UsersService, environment.apiUrl, 'users');
    readonly roles = this.utils.extendClass<Role, RolesService>(RolesService, environment.apiUrl, 'roles');
    readonly configs = this.utils.extendClass<Config, ConfigsService>(ConfigsService, environment.apiUrl, 'operations');

}
