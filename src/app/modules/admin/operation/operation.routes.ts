
import { Routes } from '@angular/router';
import { OperationComponent } from './operation.component';
import { UpdateComponent } from './update/update.component';

export default [
    {
        path     : '',
        component: OperationComponent,
        title: 'Operation list',
    },
    {
        path     : ':id',
        component: UpdateComponent,
        title: 'Operation update',
    },
] as Routes;
            