import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { FuseAlertComponent } from '@fuse/components/alert';
import { UowService } from 'app/core/http-services/uow.service';
import { map } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-home',
    encapsulation  : ViewEncapsulation.None,
    templateUrl    : './home.component.html',
    styles: [``],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FuseAlertComponent,
        MatPaginatorModule,
        FormsModule,
        ReactiveFormsModule,
        MatSortModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
})
export class HomeComponent
{
    readonly uow = inject(UowService);

    @ViewChild(MatPaginator, { static: true })
    readonly paginator: MatPaginator;

    readonly orderBy = [
        'Date',
        'Salary',
        'Localisation',
        'ContractType',
        'Skill',
    ];

    readonly #all$ = this.uow.core.filters.get$;
    readonly contractTypes$ = this.#all$.pipe(map(e => e.filter(f => f.name === 'contract')));
    readonly localisations$ = this.#all$.pipe(map(e => e.filter(f => f.name === 'location')));
    readonly skills$ = this.#all$.pipe(map(e => e.filter(f => f.name === 'skills')));

    readonly name =  new FormControl('');
}
