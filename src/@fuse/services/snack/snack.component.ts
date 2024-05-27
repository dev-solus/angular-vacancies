import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, map, switchMap, tap } from 'rxjs';
import { SnackService } from './snack.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-snack',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
  ],
  template: '',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnackComponent {
  readonly snackbarService = inject(SnackService);
  readonly router = inject(Router);
  readonly snackBar = inject(MatSnackBar);

  readonly onOpen$ = toSignal(this.snackbarService.snackbar$.pipe(
    map(e => this.snackBar.open(e.message, e.action, (e.config as any) || {
      duration: 5000,
      panelClass: ['green-snackbar']
    })),
    switchMap((snackBarRef) => snackBarRef.onAction()),
    tap(() => this.router.navigate(['/basket'])),
  ));
}
