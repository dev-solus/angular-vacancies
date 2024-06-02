
import { Routes } from '@angular/router';
import { JobComponent } from './job.component';
import { UpdateComponent } from './update/update.component';

export default [
    {
        path     : '',
        component: JobComponent,
        title: 'Job list',
    },
    {
        path     : ':id',
        component: UpdateComponent,
        title: 'Job update',
    },
] as Routes;
            