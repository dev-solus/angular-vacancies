export * from './accounts.service';
import { AccountsService } from './accounts.service';
export * from './configs.service';
import { ConfigsService } from './configs.service';
export * from './jobs.service';
import { JobsService } from './jobs.service';
export * from './roles.service';
import { RolesService } from './roles.service';
export * from './scraping.service';
import { ScrapingService } from './scraping.service';
export * from './users.service';
import { UsersService } from './users.service';
export const APIS = [AccountsService, ConfigsService, JobsService, RolesService, ScrapingService, UsersService];
