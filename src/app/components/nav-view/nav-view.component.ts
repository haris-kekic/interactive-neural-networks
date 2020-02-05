import { Component, OnInit, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { NeuralNetworkService } from 'src/app/core/services/neural-network.service';
import { StorageSelectorService } from 'src/app/core/services/sample-storage.service';
import { BsModalService, ModalOptions } from 'ngx-bootstrap';
import { ConfigDatasetComponent } from '../config-dataset/config-dataset.component';
import { PhaseModalComponent, PhaseModalOptions } from '../phase-modal/phase-modal.component';
import { ViewBaseComponent } from '../view-base/view-base.component';
import { DialogService } from 'src/app/core/services/dialog.service';
import { ModeComponentSelectorService } from 'src/app/core/services/mode-selector.service';
import { NeuralNetworkView, NeuralNetworkMode } from 'src/app/core/models/artifacts';
import { DialogResult } from '../dialog-modal/dialog-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'nn-nav-view',
  templateUrl: './nav-view.component.html',
  styleUrls: ['./nav-view.component.scss']
})
export class NavViewComponent implements OnInit {

  @Output() viewChange = new EventEmitter<NeuralNetworkView>();
  @Input() view: NeuralNetworkView;

  @Output() modeChange = new EventEmitter<NeuralNetworkMode>();
  @Input() mode: NeuralNetworkMode;

  neuralNetworkView = NeuralNetworkView;
  neuralNetworkMode = NeuralNetworkMode;

  constructor(public neuralNetworkService: NeuralNetworkService,
              public storageSelectorService: StorageSelectorService,
              public modeComponentSelectorService: ModeComponentSelectorService,
              public dialogService: DialogService,
              public modalService: BsModalService,
              public router: Router) { }

  ngOnInit() {
     this.neuralNetworkService.setWorkingStorage(this.storageSelectorService.getService(this.mode), this.mode);
  }

  setView(view: NeuralNetworkView) {
    this.view = view;
    this.viewChange.emit(this.view);
  }

  // Obsolte: In an earlier version, there was the intention to change between phases
  // but for now, for the test set, only the error is calculated
  setMode(mode: NeuralNetworkMode) {
    this.mode = mode;
    this.neuralNetworkService.setWorkingStorage(this.storageSelectorService.getService(mode), this.mode);

    /* In the initial version a popup with all the corresponding samples for either test or execution would open */

    // const component = this.phaseComponentSelectorService.getComponent(phase);

    // const initParams = { options: { component, proceedCondition: storageService.hasSamples } } ;
    // const modalRef =
    // this.modalService.show(PhaseModalComponent, { class: 'default-modal', backdrop: 'static', initialState: initParams});
    // modalRef.content.proceed.subscribe(() => {
    //   this.mode = phase;
    //   this.neuralNetworkService.setStorage(storageService);

    //   this.modeChange.emit(this.mode);
    // });
  }

  async backToConfig() {
    const result = await this.dialogService.question('Question', 'Current neural network configuration will be discarded. Are you sure, you want to preceed?');
    if (result === DialogResult.YES) {
      this.router.navigate(['/config']);
    }
  }
}
