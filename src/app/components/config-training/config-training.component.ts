import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, AfterViewInit, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { Sample, NeuralNetworkService } from 'src/app/core/services/neural-network.service';
import { SampleStorageService, TrainingSampleStorageService } from 'src/app/core/services/sample-storage.service';
import { Observable, Subject, pipe } from 'rxjs';
import { ParsingService } from 'src/app/core/services/parsing.service';
import { ViewBaseComponent } from '../view-base/view-base.component';
import { ToastrService } from 'ngx-toastr';
import { Converter } from 'src/app/core/utils/converter';
import { debounceTime, distinctUntilChanged, elementAt, tap, takeUntil } from 'rxjs/operators';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NeuralNetworkTrainingConfig, TrainingConfigDefaults } from 'src/app/core/models/artifacts';


@Component({
  selector: 'nn-config-training',
  templateUrl: './config-training.component.html',
  styleUrls: ['./config-training.component.scss']
})
export class ConfigTrainingComponent extends ViewBaseComponent implements OnInit, OnDestroy, OnChanges {

  // we dont use input binding in config because this component needs to be used later in a modal
  // and there we dont have access to the previous configuration step in wizard
  layerNeurons: number[] = [];
  samples: Observable<Sample[]>;
  sampleCount: Observable<number>;

  config: NeuralNetworkTrainingConfig = TrainingConfigDefaults;

  sliderOptions = { floor: 0, ceil: 100, tickStep: 10, minLimit: 10, maxLimit: 90, showTicks: true, step: 10, animate: false };

  readonly constParam = { SAMPLE_LIMIT: 500 };

  fileLoaderId = 'file-loader';

  @Input() private activated: boolean;
  @Input() private save!: EventEmitter<any>;

  constructor(protected sampleStorageService: TrainingSampleStorageService,
              protected neuralNetworkService: NeuralNetworkService,
              protected parsingService: ParsingService,
              protected toastService: ToastrService,
              protected loaderService: NgxUiLoaderService) {
                super();
              }

  ngOnInit() {
    this.samples = this.sampleStorageService.samples;
    this.sampleCount = this.sampleStorageService.sampleCount;
    this.sampleStorageService.pull();

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.initialization.subscribe((initConfig) => {
      if (initConfig === null) {
        return;
      }
      this.layerNeurons = initConfig.layerNeurons;
    });

    if (this.save) {
      this.save.subscribe(() => {
        this.neuralNetworkService.initializeTraining(this.config);
        this.sampleStorageService.push();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activated) {
      this.sampleStorageService.pull();
    }
  }

  addSample() {
    const inputLayerNeurons = this.layerNeurons[0];
    const outputLayerNeurons = this.layerNeurons[this.layerNeurons.length - 1];
    const sample = { input: Array<number>(inputLayerNeurons).fill(0.1), output: Array<number>(outputLayerNeurons).fill(0.1) };
    this.sampleStorageService.addSample(sample);
  }

  clearSamples() {
    this.sampleStorageService.clear();
  }

  uploadTrainingSamples(fileEvent: any) {
    this.clearSamples();

    if (fileEvent.target.files && fileEvent.target.files.length > 0) {
      const inputLayerNeurons = this.layerNeurons[0];
      const outputLayerNeurons = this.layerNeurons[this.layerNeurons.length - 1];

      const file = fileEvent.target.files[0];
      const reader = new FileReader();

      this.loaderService.startLoader(this.fileLoaderId);

      reader.onload = () => {
        const csv: string = reader.result.toString();
        this.subscriptions[this.subscriptions.length] = this.parsingService.parseCsvFile(csv).subscribe((resultTable) => {
          if (resultTable.length > this.constParam.SAMPLE_LIMIT) {
            resultTable.splice(this.constParam.SAMPLE_LIMIT, resultTable.length);
            this.toastService.warning(`Limit of ${this.constParam.SAMPLE_LIMIT} exceeded: Only ${this.constParam.SAMPLE_LIMIT} imported.`);
          }

          const expectedValueCount = inputLayerNeurons + outputLayerNeurons;
          let row = 0;
          for (; row < resultTable.length; row++) {
            const values = resultTable[row];
            if (values.length === 0 || values.length !== expectedValueCount) {
              this.toastService.warning(`Row '${row}' not imported: Expected values count is '${expectedValueCount}'`);
              continue;
            }

            const inputData = values.slice(0, inputLayerNeurons);
            const outputData = values.slice(inputLayerNeurons, expectedValueCount);
            const sample = { input: inputData.map(id => Converter.floatOrZero(id) ),
                             output: outputData.map(od => Converter.floatOrZero(od)) };
            this.sampleStorageService.addSample(sample);
          }

          this.loaderService.stopLoader(this.fileLoaderId);
        });

        fileEvent.target.value = '';
      };

      reader.readAsText(file);
    }
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  getTrainTestRatio() {
    return this.config.trainDataPortion + '/' + (this.sliderOptions.ceil - this.config.trainDataPortion);
  }
}
