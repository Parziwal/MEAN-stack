import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export const errorHandler = (errorRes: HttpErrorResponse) => {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error.message) {
      return throwError(errorRes);
    }

    errorMessage = errorRes.error.message;
    return throwError(errorMessage);
};