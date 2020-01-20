import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NeuralNetworkService, Sample } from 'src/app/core/services/neural-network.service';
import { trigger, transition, style, group, animate } from '@angular/animations';
import { MovingDirection } from 'angular-archwizard';
import { Router } from '@angular/router';
import { TrainingSampleStorageService, TestSampleStorageService } from 'src/app/core/services/sample-storage.service';
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
              protected router: Router) { }

  curStep = -1;

  saveNeuralNetworkPhase: EventEmitter<any> = new EventEmitter();
  saveDatasetPhase: EventEmitter<any> = new EventEmitter();

  hasSamples: boolean;

  selectedPlayground = NeuralNetworkPlayground.CUSTOM;
  playgrounds = NeuralNetworkPlayground;


  ngOnInit() {
  }

  samplesChanged(count: number) {
    this.hasSamples = count > 0;
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
