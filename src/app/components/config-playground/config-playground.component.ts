import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { NeuralNetworkPlayground } from 'src/app/core/models/artifacts';
import { TrainingSampleStorageService, TestSampleStorageService } from 'src/app/core/services/sample-storage.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'nn-config-playground',
  templateUrl: './config-playground.component.html',
  styleUrls: ['./config-playground.component.scss']
})
export class ConfigPlaygroundComponent implements OnInit {
  @Input() selected: string;
  @Output() selectedChange = new EventEmitter<string>();

  playground = NeuralNetworkPlayground;

  constructor(protected trainingStorageService: TrainingSampleStorageService,
              protected testStorageService: TestSampleStorageService,
              protected translate: TranslateService) {
    // reset everything if set
    this.trainingStorageService.clear();
    this.trainingStorageService.push();
    this.testStorageService.clear();
    this.testStorageService.push();
  }

  ngOnInit() {

  }

  valueChange(selected) {
    console.log(selected);
    this.selected = selected;
    this.selectedChange.emit(this.selected);
  }

}
