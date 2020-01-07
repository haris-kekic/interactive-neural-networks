import { Component, OnInit, OnDestroy } from '@angular/core';
import { NeuralNetworkService } from 'src/app/core/services/neural-network.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'nn-view-base',
  templateUrl: './view-base.component.html',
  styleUrls: ['./view-base.component.css']
})
export class ViewBaseComponent implements OnInit, OnDestroy {

  protected subscriptions: Subscription[] = [];

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
