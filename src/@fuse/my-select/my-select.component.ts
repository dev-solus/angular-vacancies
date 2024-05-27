import { AsyncPipe, JsonPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@ngneat/transloco';
import { Observable, Subject, filter, map, startWith, switchMap, tap } from 'rxjs';

@Component({
    selector: 'app-my-select',
    standalone: true,
    imports: [
        AsyncPipe,
        JsonPipe,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        TranslocoModule,
        MatAutocompleteModule,
    ],
    template: `
   <mat-form-field [class]="class">
      <input type="text" [placeholder]="ph | transloco" matInput [formControl]="fc" [matAutocomplete]="auto">
      <mat-autocomplete [displayWith]="display(key)" autoActiveFirstOption #auto="matAutocomplete">
          <!-- @for (e of dataSource$ | async; track e.id) {
          <mat-option [value]="e" (click)="optionClick.next(e)">{{isString(e) ? e : e[key]}}</mat-option>
          } -->

          @for (e of dataSource$ | async; track $index) {
            <mat-optgroup [label]="isString(e) ? e : e[key]">
            @if (e.accounts) {
                @for (c of e.accounts; track $index) {
                <mat-option [value]="c.id">{{c.accountNumber}} - Solde: {{c.balance}}</mat-option>
                }
            }
            </mat-optgroup>
            }


      </mat-autocomplete>
  </mat-form-field>
  `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MySelectComponent implements AfterViewInit {
    @Output() readonly optionClick = new EventEmitter<any>();

    @Input() class = 'example-full-width w-full';
    @Input() ph = '';
    @Input() key = 'name';

    @Input({ required: false })
    fc = new FormControl<any>(null);

    @Input({ required: true })
    list: Observable<any[]>;

    readonly logClick = toSignal(this.optionClick.pipe(
        // tap(e => console.warn(e)),
    ))

    isString = (e) => typeof e === 'string' || typeof e === 'number';

    readonly viewInit$ = new Subject<void>();

    readonly dataSource$ = this.viewInit$.pipe(
        switchMap(_ => this.fc.valueChanges.pipe(
            startWith(''),
            filter(e => typeof e === 'string'),
            switchMap((text: string) => this.list.pipe(
                map(list => list.filter(f => {
                    if (!text) {
                        return true;
                    }
                    if (typeof f === 'string') {
                        return f.toLowerCase().includes(text?.toLowerCase()?.trim());
                    }

                    return f[this.key]?.toLowerCase().includes(text?.toLowerCase()?.trim())
                })),
            )),
        ))
    )

    ngAfterViewInit(): void {
        this.viewInit$.next();
    }

    display = (key: string) => (e: any) => this.isString(e) ? e : e?.[key] ?? '';
}
