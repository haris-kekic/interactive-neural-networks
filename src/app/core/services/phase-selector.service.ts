import { Injectable } from '@angular/core';
import { ConfigTrainingComponent } from 'src/app/components/config-training/config-training.component';
import { ConfigExecutionComponent } from 'src/app/components/config-execution/config-execution.component';
import { NeuralNetworkPhase } from '../models/artifacts';

@Injectable({
  providedIn: 'root'
})
export class PhaseComponentSelectorService {
  constructor() { }

  getComponent(phase: NeuralNetworkPhase) {
    let component: any;
    switch (phase) {
      case NeuralNetworkPhase.TRAINING:
        component = ConfigTrainingComponent;
        break;
      case NeuralNetworkPhase.EXECUTION:
        component = ConfigExecutionComponent;
        break;
    }

    return component;
  }
}
