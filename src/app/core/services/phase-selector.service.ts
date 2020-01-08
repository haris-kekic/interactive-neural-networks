import { Injectable } from '@angular/core';
import { ConfigDatasetComponent } from 'src/app/components/config-dataset/config-dataset.component';
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
        component = ConfigDatasetComponent;
        break;
      case NeuralNetworkPhase.TEST:
        component = ConfigExecutionComponent;
        break;
    }

    return component;
  }
}
