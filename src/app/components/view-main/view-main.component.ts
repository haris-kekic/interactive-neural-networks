import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NeuralNetworkService } from 'src/app/core/services/neural-network.service';
import { ViewBaseComponent } from '../view-base/view-base.component';
import { MessageBoardService } from 'src/app/core/services/message-board.service';
import { MessageToken } from 'src/app/core/models/message';
import { NeuralNetworkView, NeuralNetworkMode } from 'src/app/core/models/artifacts';

@Component({
  selector: 'nn-view-main',
  templateUrl: './view-main.component.html',
  styleUrls: ['./view-main.component.css']
})
export class ViewMainComponent extends ViewBaseComponent implements OnInit, OnDestroy {

  neuralNetworkView = NeuralNetworkView;

  curView = NeuralNetworkView.GRAPH;
  curMode = NeuralNetworkMode.TRAINING;

  constructor(protected neuralNetworkService: NeuralNetworkService,
              protected messageService: MessageBoardService) {
                  super();
              }

  ngOnInit() {

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.initialization.subscribe(() => {
      this.messageService.postMessage(MessageToken.INITIALIZATION, null);
    });

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.forwardPropagation.subscribe((result) => {
      this.messageService.postMessage(MessageToken.CALCOUTPUT, { layer: result.layer });
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

}
