import { environment } from 'environments/environment.development';
import { Injectable, inject } from '@angular/core';
import { UtilsService } from './utils.service';
import { AccountsService, Config, ConfigsService, Filter, MyFiltersService, Job, JobsService, Role, RolesService, ScrapingService, User, UsersService, Submission, SubmissionsService } from '../api';
import { MyScrapingService } from './my.scraping.service';
import { GeminiService } from './gemini.service';



@Injectable({
    providedIn: 'root'
})
export class CoreService {
    readonly utils = inject(UtilsService);

    readonly auth = this.utils.extendClass<User, AccountsService>(AccountsService, environment.apiUrl, 'Accounts');

    readonly users = this.utils.extendClass<User, UsersService>(UsersService, environment.apiUrl, 'users');
    readonly roles = this.utils.extendClass<Role, RolesService>(RolesService, environment.apiUrl, 'roles');
    readonly configs = this.utils.extendClass<Config, ConfigsService>(ConfigsService, environment.apiUrl, 'configs');
    readonly jobs = this.utils.extendClass<Job, JobsService>(JobsService, environment.apiUrl, 'jobs');
    readonly filters = this.utils.extendClass<Filter, MyFiltersService>(MyFiltersService, environment.apiUrl, 'myFilters');
    // readonly scrapings = this.utils.extendClass<Job, ScrapingService>(ScrapingService, environment.apiUrl, 'scrapings');
    readonly myScrapings = this.utils.extendClass<Job, MyScrapingService>(MyScrapingService, environment.apiUrl, 'scraping');
    readonly gemini = this.utils.extendClass<any, GeminiService>(GeminiService, environment.apiUrl, 'gemini');
    // submissions
    readonly submissions = this.utils.extendClass<Submission, SubmissionsService>(SubmissionsService, environment.apiUrl, 'submissions');

}
