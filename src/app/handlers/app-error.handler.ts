import { ErrorHandler, Injectable, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';


@Injectable()
export class AppErrorHandler implements ErrorHandler {
  constructor(protected toastService: ToastrService) { }

  handleError(error: any): void {
    console.error(error);
    this.toastService.error('An error occurred while executing request!');
  }
}
