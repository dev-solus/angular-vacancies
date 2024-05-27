import { Injectable } from '@angular/core';
import { MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SnackService {

  private snackbarSubject = new Subject<{message: string, action?: string, config:  MatSnackBarRef<TextOnlySnackBar>}>();
  snackbar$ = this.snackbarSubject.asObservable();

  open(message = 'Opération effectuée avec succès', action: string = null, config = null) {
    this.snackbarSubject.next({message, action, config});
  }
}
