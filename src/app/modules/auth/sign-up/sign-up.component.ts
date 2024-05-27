import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { UowService } from 'app/core/http-services/uow.service';
import { Subject, catchError, tap, filter, map, switchMap, delay } from 'rxjs';

@Component({
    selector     : 'auth-sign-up',
    templateUrl  : './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [RouterLink, NgIf, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule],
})
export class AuthSignUpComponent implements OnInit
{
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private uow: UowService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.signUpForm = this._formBuilder.group({
                firstname      : ['', Validators.required],
                lastname      : ['', Validators.required],
                email     : ['', [Validators.required, Validators.email]],
                password  : ['', Validators.required],
                company   : [''],
                agreements: ['', Validators.requiredTrue],
                RoleId: [2, [Validators.required, Validators.min(1)]]
            },
        );

        this.initializeFormSubmission();
    }

    private post$ = new Subject<void>();
    private initializeFormSubmission(): void {
        this.post$.pipe(
            tap(_ => this.signUpForm.markAllAsTouched()),
            filter(_ => this.signUpForm.valid),
            tap(_ => this.signUpForm.disable()),
            map(_ => this.signUpForm.getRawValue()),
            switchMap(formValues => this.uow.core.auth.register(formValues).pipe(
                catchError(this.uow.handleError)
            )),
            tap(_ => {
                console.log('Registration successful');
                this._router.navigateByUrl('/confirmation-required'); // Navigate on success
            }),
            delay(500),
            tap(_ => console.log('Re-enabling form after delay')), // New log
            tap(_ => this.signUpForm.enable()) // Re-enable the form after a delay
        ).subscribe();
    }



    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */

    signUp(): void {
        this.post$.next();
    }

}

/*     signUp(): void
    {
        // Do nothing if the form is invalid
        if ( this.signUpForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signUpForm.disable();

        // Hide the alert
        this.showAlert = false;

        this._authService.signUp(this.signUpForm.value).subscribe({
            next: (response) => {
              this._router.navigateByUrl('/confirmation-required'); // Navigate on success
            },
            error: (response) => {
              this.signUpForm.enable(); // Re-enable the form

              this.signUpNgForm.resetForm(); // Reset the form

              // Set and show the alert
                this.alert = {
                type: 'error',
                message: 'Something went wrong, please try again.',
                };
                this.showAlert = true;
            },
            });

        // Sign up
         this._authService.signUp(this.signUpForm.value)
            .subscribe(
                (response) =>
                {
                    // Navigate to the confirmation required page
                    this._router.navigateByUrl('/confirmation-required');
                },
                (response) =>
                {
                    // Re-enable the form
                    this.signUpForm.enable();

                    // Reset the form
                    this.signUpNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: 'Something went wrong, please try again.',
                    };

                    // Show the alert
                    this.showAlert = true;
                },
            );
    } */
