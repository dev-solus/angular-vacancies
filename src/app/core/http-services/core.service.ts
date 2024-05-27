import { environment } from 'environments/environment.development';
import { Injectable, inject } from '@angular/core';
import { UtilsService } from './utils.service';
import { User, AuthControllerService, UsersControllerService, Role, RolesControllerService, Account, AccountsControllerService, Operation, OperationsControllerService } from '../api';



@Injectable({
    providedIn: 'root'
})
export class CoreService {
    readonly utils = inject(UtilsService);

    readonly auth = this.utils.extendClass<User, AuthControllerService>(AuthControllerService, environment.apiUrl, 'auth');

    readonly users = this.utils.extendClass<User, UsersControllerService>(UsersControllerService, environment.apiUrl, 'users');
    readonly roles = this.utils.extendClass<Role, RolesControllerService>(RolesControllerService, environment.apiUrl, 'roles');
    readonly accounts = this.utils.extendClass<Account, AccountsControllerService>(AccountsControllerService, environment.apiUrl, 'accounts');
    readonly operations = this.utils.extendClass<Operation, OperationsControllerService>(OperationsControllerService, environment.apiUrl, 'operations');

}
