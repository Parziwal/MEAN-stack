import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})

export class SignupComponent {
    isLoading = false;
    @ViewChild('signupForm') signupForm: NgForm;
    errorMessage: string = '';

    constructor(private authService: AuthService) {}

    onSignup() {
        if(this.signupForm.invalid)
            return;

        this.isLoading = true;
        this.authService.createUser(this.signupForm.value.email, this.signupForm.value.password).subscribe((response) => {
            this.isLoading = false;
        }, (error) => {
            this.isLoading = false;
            this.errorMessage = error;
        });
    }
}