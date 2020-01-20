import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, AfterViewInit, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { Sample, NeuralNetworkService } from 'src/app/core/services/neural-network.service';
import { SampleStorageService, TrainingSampleStorageService, TestSampleStorageService } from 'src/app/core/services/sample-storage.service';
import { Observable, Subject, pipe, concat } from 'rxjs';
import { ParsingService } from 'src/app/core/services/parsing.service';
import { ViewBaseComponent } from '../view-base/view-base.component';
import { ToastrService } from 'ngx-toastr';
import { Converter } from 'src/app/core/utils/converter';
import { debounceTime, distinctUntilChanged, elementAt, tap, takeUntil, concatAll } from 'rxjs/operators';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NeuralNetworkDatasetConfig, DatasetConfigDefaults } from 'src/app/core/models/artifacts';
import { math } from 'src/app/core/utils/math-extension';


@Component({
  selector: 'nn-config-dataset',
  templateUrl: './config-dataset.component.html',
  styleUrls: ['./config-dataset.component.scss']
})
export class ConfigDatasetComponent extends ViewBaseComponent implements OnInit, OnDestroy, OnChanges {

  // we dont use input binding in config because this component needs to be used later in a modal
  // and there we dont have access to the previous configuration step in wizard
  layerNeurons: number[] = [];

  samples: Sample[] = [];

  @Output() samplesChanged = new EventEmitter<number>();

  config: NeuralNetworkDatasetConfig = DatasetConfigDefaults;

  sliderOptions = { floor: 0, ceil: 100, tickStep: 10, minLimit: 10, maxLimit: 90, showTicks: true, step: 10, animate: false };

  readonly constParam = { SAMPLE_LIMIT: 500, SAMPLE_MINVALUE: 0.001, SAMPLE_MAXVALUE: 0.999 };

  fileLoaderId = 'file-loader';

  @Input() private activated: boolean;
  @Input() private save!: EventEmitter<any>;

  constructor(protected trainStorageService: TrainingSampleStorageService,
              protected testStorageService: TestSampleStorageService,
              protected neuralNetworkService: NeuralNetworkService,
              protected parsingService: ParsingService,
              protected toastService: ToastrService,
              protected loaderService: NgxUiLoaderService) {
                super();
              }

  ngOnInit() {
    this.subscriptions[this.subscriptions.length] = concat(this.trainStorageService.samples, this.testStorageService.samples)
                                                      .subscribe((samples) => {
                                                        //this.samples = samples;
                                                      });

    this.subscriptions[this.subscriptions.length] = concat(this.trainStorageService.sampleCount, this.testStorageService.sampleCount)
                                                    .subscribe((sampleCount) => {

                                                    });

    // this.trainSamples = this.trainStorageService.samples;
    // this.trainSampleCount = this.trainStorageService.sampleCount;
    // this.trainStorageService.pull();

    // this.testSamples = this.testStorageService.samples;
    // this.testSampleCount = this.testStorageService.sampleCount;
    // this.testStorageService.pull();



    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.initialization.subscribe((initConfig) => {
      if (initConfig === null) {
        return;
      }
      this.layerNeurons = initConfig.layerNeurons;
    });

    if (this.save) {
      this.save.subscribe(() => {
        const trainSampleCount = math.floor((this.config.trainTestDataRatio / 100) * this.samples.length);

        this.trainStorageService.clear();
        this.testStorageService.clear();

        this.trainStorageService.addSamples(this.samples.slice(0, trainSampleCount));
        this.testStorageService.addSamples(this.samples.slice(trainSampleCount));

        // Mix and shuffle the samples
        this.trainStorageService.shuffleSamples();
        this.testStorageService.shuffleSamples();

        // push to persistance
        this.trainStorageService.push();
        this.testStorageService.push();

        this.neuralNetworkService.initializeTraining(this.config);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  addSample() {
    const inputLayerNeurons = this.layerNeurons[0];
    const outputLayerNeurons = this.layerNeurons[this.layerNeurons.length - 1];
    const sample = { input: Array<number>(inputLayerNeurons).fill(0.1), output: Array<number>(outputLayerNeurons).fill(0.1) };
    this.samples.push(sample);

    this.samplesChanged.emit(this.samples.length);
  }

  clearSamples() {
    this.samples.splice(0, this.samples.length);
    this.samplesChanged.emit(this.samples.length);
  }

  uploadSamples(fileEvent: any) {
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
            if (this.isScaled(sample)) {
              this.samples.push(sample);
            }
          }

          this.loaderService.stopLoader(this.fileLoaderId);

          this.samplesChanged.emit(this.samples.length);
        });

        fileEvent.target.value = '';
      };

      reader.readAsText(file);
    }
  }

  isScaled(sample: Sample): boolean {
    return sample.input.every(value => value >= this.constParam.SAMPLE_MINVALUE && value <= this.constParam.SAMPLE_MAXVALUE)
            && sample.output.every(value => value >= this.constParam.SAMPLE_MINVALUE && value <= this.constParam.SAMPLE_MAXVALUE);
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  getTrainTestRatio() {
    return this.config.trainTestDataRatio + '/' + (this.sliderOptions.ceil - this.config.trainTestDataRatio);
  }
}
