import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { NeuralNetworkService } from 'src/app/core/services/neural-network.service';
import { NeuralNetworkConfig } from 'src/app/core/models/artifacts';

@Component({
  selector: 'nn-config-builtin',
  templateUrl: './config-builtin.component.html',
  styleUrls: ['./config-builtin.component.scss']
})
export class ConfigBuiltinComponent implements OnInit {

  config: NeuralNetworkConfig;

  @Input() save!: EventEmitter<any>;

  constructor(protected neuralNetworkService: NeuralNetworkService) { }

  ngOnInit() {
    if (this.save) {
      this.save.subscribe(() => {
        // this.neuralNetworkService.initialize(this.config);
      });
    }
  }

}
