import { Component, OnInit } from '@angular/core';
import { NeuralNetworkService } from './core/services/neural-network.service';
import { FeedForwardNeuralNetwork } from './core/models/feedforward-neural-network';
import { TrainingSampleStorageService, TestSampleStorageService } from './core/services/sample-storage.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'nn-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  configFinished: boolean;

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
    translate.use('en');

    translate.get('HELLO').subscribe((res) => {
      console.log(res);
    });
  }

  ngOnInit() { }

  onConfigFinished() {
    this.configFinished = true;
  }
}
