import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { BaseChartDirective, Label, Color } from 'ng2-charts';
import { ChartDataSets, ChartOptions } from 'chart.js';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { NeuralNetworkService } from 'src/app/core/services/neural-network.service';
import { math } from 'src/app/core/utils/math-extension';
import { ViewBaseComponent } from '../view-base/view-base.component';
import { TrainingSampleStorageService } from 'src/app/core/services/sample-storage.service';
import { Observable } from 'rxjs';
import { NeuralNetworkConfig } from 'src/app/core/models/artifacts';

@Component({
  selector: 'nn-progress-board',
  templateUrl: './progress-board.component.html',
  styleUrls: ['./progress-board.component.css']
})
export class ProgressBoardComponent extends ViewBaseComponent implements OnInit, OnDestroy {

  errorFormula: string;

  public errorChartData: ChartDataSets[] = [
    { data: [], label: 'Global Loss Function' }
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
  public globalError = 0;
  public sampleCount = 0;
  public processedSamplesCount: Observable<number>;

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  constructor(protected neuralNetworkService: NeuralNetworkService,
              protected storageService: TrainingSampleStorageService) { super(); }

  ngOnInit() {

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.initialization.subscribe((config) => {
       this.errorFormula = config.errorFormula;
    });

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.globalErrorCalculated.subscribe((globalError) => {
      this.errorChartData[0].data[this.errorChartData[0].data.length] = globalError;
      this.globalError = globalError;
    });

    this.subscriptions[this.subscriptions.length] = this.storageService.sampleCount.subscribe((sampleCount) => {
      this.errorChartLabels = Array.from({length: sampleCount + 1}, (x, i) => (i).toString());
      this.sampleCount = sampleCount;
    });

    this.processedSamplesCount = this.storageService.processedSampleCount;
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
