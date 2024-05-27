
import { Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { UpdateComponent } from './update/update.component';

export default [
    {
        path     : '',
        component: UserComponent,
        title: 'User list',
    },
    {
        path     : ':id',
        component: UpdateComponent,
        title: 'User update',
    },
] as Routes;
            