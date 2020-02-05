import { Component, OnInit, OnDestroy } from '@angular/core';
import { NeuralNetworkService, Sample } from 'src/app/core/services/neural-network.service';
import { ViewBaseComponent } from '../view-base/view-base.component';
import { Observable } from 'rxjs';
import { SampleStorageService } from 'src/app/core/services/sample-storage.service';
import { NeuralNetworkMatrices } from 'src/app/core/models/artifacts';

@Component({
  selector: 'nn-view-matrix',
  templateUrl: './view-matrix.component.html',
  styleUrls: ['./view-matrix.component.css']
})
export class ViewMatrixComponent extends ViewBaseComponent implements OnInit, OnDestroy {

  matrices: NeuralNetworkMatrices;

  layerNeurons: number[];

  backPropagationLayer = -1;

  unprocessedSamples: Observable<Sample[]>;

  storageService: SampleStorageService;

  constructor(protected neuralNetworkService: NeuralNetworkService) {
    super();
  }

  ngOnInit() {
    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.workingStorageServiceSet.subscribe((result) => {
      this.storageService = result;
      this.unprocessedSamples = this.storageService.nextUnprocessedSamples;
    });

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.initialization.subscribe((result) => {
      this.matrices = result.matrices;
      this.layerNeurons = result.layerNeurons;
    });

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.samplePropagationStart.subscribe((result) => {
      this.matrices.outputMatrices.splice(0, this.matrices.outputMatrices.length);
      this.matrices.errorMatrices.splice(0, this.matrices.errorMatrices.length);
      this.backPropagationLayer = -1;
    },
    (err) => console.error(err));

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.forwardPropagation.subscribe((result) => {
      this.matrices.outputMatrices = result.matrices.outputMatrices;
    },
    (err) => console.error(err));

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.backPropagation.subscribe((result) => {
      this.matrices.weightMatrices = result.matrices.weightMatrices;
      this.matrices.errorMatrices = result.matrices.errorMatrices;
      this.backPropagationLayer = result.layer;
    },
    (err) => console.error(err));

  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  toMatrix(sampleData: number[]) {
    const matrix: number[][] = [];
    sampleData.forEach((item, index) => {
      matrix[matrix.length] = [item];
    });

    return matrix;
  }

}
