import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NeuralNetworkService, Sample } from 'src/app/core/services/neural-network.service';
import { trigger, transition, style, group, animate } from '@angular/animations';
import { MovingDirection } from 'angular-archwizard';
import { Router } from '@angular/router';
import { TrainingSampleStorageService, ExecutionSampleStorageService } from 'src/app/core/services/sample-storage.service';
import { Observable } from 'rxjs';
import { NeuralNetworkPlayground } from 'src/app/core/models/artifacts';

@Component({
  selector: 'nn-config-main',
  templateUrl: './config-main.component.html',
  styleUrls: ['./config-main.component.scss'],
  animations: [
    trigger('appearance', [
      transition('* -> appear', [
        style({ opacity: 0 }), animate('0.5s', style({ opacity: 1 }))
      ]),
      transition('appear -> *', [
        animate('0.5s', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ConfigMainComponent implements OnInit {

  constructor(protected neuralNetworkService: NeuralNetworkService,
              protected trainingStorageService: TrainingSampleStorageService,
              protected executionStorageService: ExecutionSampleStorageService,
              protected router: Router) { }

  curStep = -1;

  saveNeuralNetworkPhase: EventEmitter<any> = new EventEmitter();
  saveTrainingPhase: EventEmitter<any> = new EventEmitter();
  saveExecutionPhase: EventEmitter<any> = new EventEmitter();

  trainingHasSamples = new Observable<boolean>();
  outputHasSamples = new Observable<boolean>();

  selectedPlayground = NeuralNetworkPlayground.CUSTOM;
  playgrounds = NeuralNetworkPlayground;


  ngOnInit() {
    this.trainingHasSamples = this.trainingStorageService.hasSamples;
    this.outputHasSamples = this.executionStorageService.hasSamples;
  }

  onStepEnter(step: MovingDirection) {
    // This event is triggered on initial start with step = 0 (foward),
    // this is why the initial curStep value is set to -1
    if (step === MovingDirection.Forwards) {
      this.curStep ++;
    } else if (step === MovingDirection.Backwards) {
      this.curStep --;
    }
  }

  finish() {
    this.router.navigate(['/view']);
  }
}
