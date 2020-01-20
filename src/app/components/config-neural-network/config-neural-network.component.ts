import { Component, OnInit, Input, EventEmitter, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { NeuralNetworkService } from 'src/app/core/services/neural-network.service';
import { ToastrService } from 'ngx-toastr';
import { TrainingSampleStorageService, TestSampleStorageService } from 'src/app/core/services/sample-storage.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { WeightDistribution,
        NeuralNetworkConfig,
        Activation,
        WeightDistributionList,
        ActivationFunctionList,
        NeuralNetworkLayer } from 'src/app/core/models/artifacts';
import { FeedForwardNeuralNetwork } from 'src/app/core/models/feedforward-neural-network';
import { copyDeep } from 'src/app/core/utils/object-functions';
import { hintTexts } from 'src/app/core/models/shared-strings';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'nn-config-neural-network',
  templateUrl: './config-neural-network.component.html',
  styleUrls: ['./config-neural-network.component.scss']
})
export class ConfigNeuralNetworkComponent implements OnInit   {

  hintTexts = hintTexts;

  sliderOptions = { floor: 0, ceil: 10, showTicksValues: true };

  readonly constParam = { MAX_NUM_LAYERS: 6 };

  config: NeuralNetworkConfig;

  @Input() save!: EventEmitter<any>;
  @Input() disableLayers: boolean;

  @ViewChild('layersection', { static: true }) layerSection: ElementRef;

  weightDistributions: WeightDistribution[] = WeightDistributionList;
  activations: Activation[] = ActivationFunctionList;

  constructor(protected toastService: ToastrService,
              protected dialogService: DialogService,
              protected neuralNetworkService: NeuralNetworkService,
              protected translate: TranslateService) {
    // setting up default network configuration
    this.config = {
      inputLabels: ['Label 1', 'Label 2', 'Label 3', 'Label 4'],
      outputLabels: ['Label 1', 'Label 2'],
      weightDistribution: WeightDistributionList[0],
      layers: [{ neuronCount: 4, activation: ActivationFunctionList[0] },
                { neuronCount: 3, activation: ActivationFunctionList[2] },
                { neuronCount: 2, activation: ActivationFunctionList[1] }]
    };
  }

  ngOnInit() {

    if (this.save) {

      this.save.subscribe(() => {

        // here you can specify different kind of neural network in future
        this.neuralNetworkService.setNeuralNetwork(new FeedForwardNeuralNetwork());
        this.neuralNetworkService.initialize(this.config);
      });
    }


  }

  removeLayer(layer: number) {
    if (this.config.layers.length > 2) {
      this.config.layers.splice(layer, 1);
    }
  }

  async addLayer() {
    if (this.config.layers.length >= this.constParam.MAX_NUM_LAYERS) {
      return;
    }
    const layer = { neuronCount: 3, activation: ActivationFunctionList[2] } as NeuralNetworkLayer;
    this.config.layers.splice(this.config.layers.length - 1, 0, layer);

    this.layerSection.nativeElement.scrollTop = this.layerSection.nativeElement.scrollHeight;
  }

  onDistributionChange(distribution: WeightDistribution) {
    this.config.weightDistribution = distribution;
  }

  onNeuronChange(layer: number, neurons: number) {
    let targetLabelArray = null;
    if (layer === 0) {
      targetLabelArray = this.config.inputLabels;
    }

    if (layer === this.config.layers.length - 1) {
      targetLabelArray = this.config.outputLabels;
    }

    if (targetLabelArray !== null) {
      const tempLabels = [...targetLabelArray];
      targetLabelArray.splice(0, targetLabelArray.length);

      for (let i = 0; i < neurons; i++) {
        targetLabelArray[i] = i < tempLabels.length ? tempLabels[i] : `Label ${(i + 1)}`;
      }
    }
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }
}
