import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { DetailsComponent } from './details/details.component';

export default [
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path: ':id',
                component: DetailsComponent,
            },
        ],
    },
] as Routes;
