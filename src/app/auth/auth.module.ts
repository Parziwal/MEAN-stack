import { NgModule } from '@angular/core';

import { ErrorModule } from '../error/error.module';
import { AuthRoutingModule } from './auth-routing.module';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        LoginComponent,
        SignupComponent
    ],
    imports: [
        ErrorModule,
        FormsModule,
        AuthRoutingModule
    ]
})

export class AuthModule {

}