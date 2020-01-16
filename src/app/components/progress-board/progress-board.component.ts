import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { BaseChartDirective, Label, Color } from 'ng2-charts';
import { ChartDataSets, ChartOptions } from 'chart.js';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { NeuralNetworkService } from 'src/app/core/services/neural-network.service';
import { math } from 'src/app/core/utils/math-extension';
import { ViewBaseComponent } from '../view-base/view-base.component';
import { TrainingSampleStorageService } from 'src/app/core/services/sample-storage.service';

@Component({
  selector: 'nn-progress-board',
  templateUrl: './progress-board.component.html',
  styleUrls: ['./progress-board.component.css']
})
export class ProgressBoardComponent extends ViewBaseComponent implements OnInit, OnDestroy {

  constructor(protected neuralNetworkService: NeuralNetworkService,
              protected storageService: TrainingSampleStorageService) { super(); }

  public errorChartData: ChartDataSets[] = [
    { data: [], label: 'Error' }
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
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public errorChartLegend = true;
  public errorChartType = 'line';
  public errorChartPlugins = [pluginAnnotations];

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;


  ngOnInit() {
    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.samplePropagationEnd.subscribe((result) => {
      const outputErrorMatrix = result.matrices.errorMatrices[result.matrices.errorMatrices.length - 1];
      const squareMatrix = math.square(outputErrorMatrix);
      const sumSquareError = math.sum(squareMatrix);
      this.errorChartData[0].data.push(sumSquareError);
    });

    this.subscriptions[this.subscriptions.length] = this.storageService.sampleCount.subscribe((sampleCount) => {
      this.errorChartLabels = Array.from({length: sampleCount}, (x, i) => (i + 1).toString());
    });
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
