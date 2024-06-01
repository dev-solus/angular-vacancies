
import { Routes } from '@angular/router';
import { ConfigComponent } from './config.component';
import { UpdateComponent } from './update/update.component';

export default [
    {
        path     : '',
        component: ConfigComponent,
        title: 'Config list',
    },
    {
        path     : ':id',
        component: UpdateComponent,
        title: 'Config update',
    },
] as Routes;
            