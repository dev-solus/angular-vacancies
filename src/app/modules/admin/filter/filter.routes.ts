
import { Routes } from '@angular/router';
import { FilterComponent } from './filter.component';
import { UpdateComponent } from './update/update.component';

export default [
    {
        path     : '',
        component: FilterComponent,
        title: 'Filter list',
    },
    {
        path     : ':id',
        component: UpdateComponent,
        title: 'Filter update',
    },
] as Routes;
            