import { Injectable } from '@angular/core';
import { ConfigDatasetComponent } from 'src/app/components/config-dataset/config-dataset.component';
import { ConfigExecutionComponent } from 'src/app/components/config-execution/config-execution.component';
import { NeuralNetworkMode } from '../models/artifacts';

@Injectable({
  providedIn: 'root'
})
export class ModeComponentSelectorService {
  constructor() { }

  getComponent(mode: NeuralNetworkMode) {
    let component: any;
    switch (mode) {
      case NeuralNetworkMode.TRAINING:
        component = ConfigDatasetComponent;
        break;
      case NeuralNetworkMode.TEST:
        component = ConfigExecutionComponent;
        break;
    }

    return component;
  }
}
