import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnDestroy, OnChanges } from '@angular/core';
import {
  Sample,
  NeuralNetworkService
} from 'src/app/core/services/neural-network.service';
import { ExecutionSampleStorageService } from 'src/app/core/services/sample-storage.service';
import { Observable, Subject } from 'rxjs';
import { ParsingService } from 'src/app/core/services/parsing.service';
import { ViewBaseComponent } from '../view-base/view-base.component';
import { ToastrService } from 'ngx-toastr';
import { Converter } from 'src/app/core/utils/converter';
import {
  debounceTime,
  distinctUntilChanged,
  elementAt,
  tap
} from 'rxjs/operators';

@Component({
  selector: 'nn-config-execution',
  templateUrl: './config-execution.component.html',
  styleUrls: ['./config-execution.component.scss']
})
export class ConfigExecutionComponent extends ViewBaseComponent
  implements OnInit, OnDestroy, OnChanges {
  // we dont use input binding in config because this component needs to be used later in a modal
  // and there we dont have access to the previous configuration step in wizard
  layerNeurons: number[] = [];
  samples: Observable<Sample[]>;

  @Input() private activated: boolean;
  @Input() private save!: EventEmitter<any>;

  constructor(
    protected sampleStorageService: ExecutionSampleStorageService,
    protected neuralNetworkService: NeuralNetworkService,
    protected parsingService: ParsingService,
    protected toastService: ToastrService
  ) {
    super();
  }

  ngOnInit() {
    this.samples = this.sampleStorageService.samples;
    this.sampleStorageService.pull();

    this.subscriptions[
      this.subscriptions.length
    ] = this.neuralNetworkService.initialization.subscribe(initConfig => {
      if (initConfig === null) {
        return;
      }
      this.layerNeurons = initConfig.layerNeurons;
    });

    if (this.save) {
      this.save.subscribe(() => {
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
    const sample = {
      input: Array<number>(inputLayerNeurons).fill(0.001),
      output: null
    };
    this.sampleStorageService.addSample(sample);
  }

  clearSamples() {
    this.sampleStorageService.clear();
  }

  uploadTrainingSamples(fileEvent: any) {
    this.clearSamples();

    if (fileEvent.target.files && fileEvent.target.files.length > 0) {
      const inputLayerNeurons = this.layerNeurons[0];

      const file = fileEvent.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const csv: string = reader.result.toString();
        this.subscriptions[
          this.subscriptions.length
        ] = this.parsingService.parseCsvFile(csv).subscribe(resultTable => {
          const expectedValueCount = inputLayerNeurons;
          for (let row = 0; row < resultTable.length; row++) {
            const values = resultTable[row];
            if (values.length === 0 || values.length !== expectedValueCount) {
              this.toastService.error(
                `There should be '${expectedValueCount}' values in row '${row}'`
              );
              continue;
            }

            const inputSequence = values.slice(0, inputLayerNeurons);
            const sample = {
              input: inputSequence.map(id => Converter.floatOrZero(id)),
              output: null
            };
            this.sampleStorageService.addSample(sample);
          }
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
}
