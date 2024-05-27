
import { Routes } from '@angular/router';
import { AccountComponent } from './account.component';
import { UpdateComponent } from './update/update.component';

export default [
    {
        path     : '',
        component: AccountComponent,
        title: 'Account list',
    },
    {
        path     : ':id',
        component: UpdateComponent,
        title: 'Account update',
    },
] as Routes;
            