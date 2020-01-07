import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { NeuralNetworkService } from '../core/services/neural-network.service';

@Injectable()
export class ViewGuard implements CanActivate {

  constructor(public neuralNetworkService: NeuralNetworkService, public router: Router) {}

  canActivate(): boolean {
    if (!this.neuralNetworkService.isInitialized) {
      this.router.navigate(['/config']);
      return false;
    }
    return true;
  }
}
