import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { DetailsComponent } from './details/details.component';
import { CvComponent } from './cv/cv.component';

export default [
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path     : '',
                pathMatch: 'full',
                component: DetailsComponent,
            },
            {
                path     : ':title/:id',
                component: DetailsComponent,
            },
            {
                path: 'cv/:title/:id',
                component: CvComponent,
            },
        ],
    },
] as Routes;
