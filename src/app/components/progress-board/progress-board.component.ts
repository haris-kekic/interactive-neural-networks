import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { BaseChartDirective, Label, Color } from 'ng2-charts';
import { ChartDataSets, ChartOptions } from 'chart.js';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { NeuralNetworkService } from 'src/app/core/services/neural-network.service';
import { math } from 'src/app/core/utils/math-extension';
import { ViewBaseComponent } from '../view-base/view-base.component';
import { TrainingSampleStorageService, SampleStorageService, TestSampleStorageService } from 'src/app/core/services/sample-storage.service';
import { Observable, zip } from 'rxjs';
import { NeuralNetworkConfig, NeuralNetworkMode } from 'src/app/core/models/artifacts';
import { map, filter } from 'rxjs/operators';

@Component({
  selector: 'nn-progress-board',
  templateUrl: './progress-board.component.html',
  styleUrls: ['./progress-board.component.css']
})
export class ProgressBoardComponent extends ViewBaseComponent implements OnInit, OnDestroy {

  errorFormula: string;

  public errorChartData: ChartDataSets[] = [
    { data: [], label: 'Global Loss (Training)' },
    { data: [], label: 'Sample Loss (Test)' },
  ];

  public errorChartLabels: Label[] = [];
  public errorChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          ticks: {
            beginAtZero: true
        }
        }
      ]
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        },
      ],
    },
  };
  public errorChartColors: Color[] = [
    { // red
      // backgroundColor: '#5CF0FD',
      borderColor: 'red',
      pointBackgroundColor: 'red',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public errorChartLegend = true;
  public errorChartType = 'line';
  public errorChartPlugins = [pluginAnnotations];
  public trainError = 0;
  public testError = 0;
  public trainSampleCount = 0;
  public testSampleCount = 0;
  public processedTrainSamplesCount: Observable<number>;
  public processedTestSamplesCount: Observable<number>;
  public currentMode: NeuralNetworkMode;
  public epoch = 1;

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  constructor(protected neuralNetworkService: NeuralNetworkService,
              protected trainStorageService: TrainingSampleStorageService,
              protected testStorageService: TestSampleStorageService) {
                super();
              }

  ngOnInit() {
    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.initialization.subscribe((config) => {
       this.errorFormula = config.errorFormula;
    });



    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.storageServiceSet.subscribe((storageService) => {
      this.currentMode = storageService.token;
    });

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.globalErrorCalculated.subscribe((globalError) => {
      if (this.currentMode === NeuralNetworkMode.TRAINING) {
        this.errorChartData[0].data[this.errorChartData[0].data.length] = globalError;
        this.trainError = globalError;
      } else {
        this.errorChartData[1].data[this.errorChartData[1].data.length] = globalError;
        this.testError = globalError;
      }
    });

    this.subscriptions[this.subscriptions.length] =
                                      zip(this.trainStorageService.sampleCount, this.testStorageService.sampleCount)
                                      .pipe(map(([trainCount, testCount]) => ({ trainCount, testCount})))
                                            .subscribe((counts) => {
                                                this.trainSampleCount = counts.trainCount;
                                                this.testSampleCount = counts.testCount;
                                                 // we take the greater count for the X-axis labels
                                                const labelCount = math.max(this.trainSampleCount, this.testSampleCount);
                                                this.errorChartLabels = Array.from({length: labelCount + 1}, (x, i) => (i).toString());
                                            });

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.sampleSetCompleted
                                                                              .pipe(filter(s => s === true)).subscribe(() => {
        if (this.currentMode === NeuralNetworkMode.TRAINING) {
                this.errorChartData[0].data.splice(0, this.errorChartData[0].data.length);
                this.epoch++;
         }
     });

    this.processedTrainSamplesCount = this.trainStorageService.processedSampleCount;
    this.processedTestSamplesCount = this.testStorageService.processedSampleCount;

    // Quickly switch to the test storage and calculate initial loss on test set
    this.neuralNetworkService.setStorage(this.testStorageService, NeuralNetworkMode.TEST);
    this.neuralNetworkService.calcGlobalError();

    // Quickly switch to back the training storage and calculate initial loss on training set
    this.neuralNetworkService.setStorage(this.trainStorageService, NeuralNetworkMode.TRAINING);
    this.neuralNetworkService.calcGlobalError();
  }

  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

}
