import { NgModule } from '@angular/core';
import { AngularMaterialModule } from '../angular-material.module';
import { CommonModule } from '@angular/common';

import { ErrorComponent } from './error.component';

@NgModule({
    declarations: [
        ErrorComponent
    ],
    imports: [
        CommonModule,
        AngularMaterialModule,
    ],
    exports: [
        ErrorComponent,
        CommonModule,
        AngularMaterialModule
    ]
})

export class ErrorModule {

}