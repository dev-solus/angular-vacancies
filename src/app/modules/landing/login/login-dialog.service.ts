import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './login.component';

@Injectable({
  providedIn: 'root'
})
export class LoginDialogService {
    readonly dialog = inject(MatDialog);


    openLoginDialog() {
        const dialogRef = this.dialog.open(LoginComponent, {
            // width: '1100px',
            // disableClose: true,
            data: {  }
        });

        return dialogRef.afterClosed();
    };

}
