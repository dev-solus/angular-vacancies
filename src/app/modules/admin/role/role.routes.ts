
import { Routes } from '@angular/router';
import { RoleComponent } from './role.component';
import { UpdateComponent } from './update/update.component';

export default [
    {
        path     : '',
        component: RoleComponent,
        title: 'Role list',
    },
    {
        path     : ':id',
        component: UpdateComponent,
        title: 'Role update',
    },
] as Routes;
            