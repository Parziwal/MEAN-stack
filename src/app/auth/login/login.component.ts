import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent {
    isLoading = false;
    @ViewChild('loginForm') loginForm: NgForm;
    errorMessage: string = ''

    constructor(private authService: AuthService) {}

    onLogin() {
        if(this.loginForm.invalid)
            return;

        this.isLoading = true;
        this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe((response) => {
            this.isLoading = false;
        }, (error) => {
            this.isLoading = false;
            this.errorMessage = error;
        });
    }
}