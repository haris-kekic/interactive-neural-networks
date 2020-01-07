import { Component, OnInit, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { NeuralNetworkService } from 'src/app/core/services/neural-network.service';
import { StorageSelectorService } from 'src/app/core/services/sample-storage.service';
import { BsModalService, ModalOptions } from 'ngx-bootstrap';
import { ConfigTrainingComponent } from '../config-training/config-training.component';
import { PhaseModalComponent, PhaseModalOptions } from '../phase-modal/phase-modal.component';
import { ViewBaseComponent } from '../view-base/view-base.component';
import { DialogService } from 'src/app/core/services/dialog.service';
import { PhaseComponentSelectorService } from 'src/app/core/services/phase-selector.service';
import { NeuralNetworkView, NeuralNetworkPhase } from 'src/app/core/models/artifacts';
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

  @Output() modeChange = new EventEmitter<NeuralNetworkPhase>();
  @Input() mode: NeuralNetworkPhase;

  neuralNetworkView = NeuralNetworkView;
  neuralNetworkMode = NeuralNetworkPhase;

  constructor(protected neuralNetworkService: NeuralNetworkService,
              protected storageSelectorService: StorageSelectorService,
              protected phaseComponentSelectorService: PhaseComponentSelectorService,
              protected dialogService: DialogService,
              protected modalService: BsModalService,
              protected router: Router) { }

  ngOnInit() {
     this.neuralNetworkService.setStorage(this.storageSelectorService.getService(this.mode));
  }

  setView(view: NeuralNetworkView) {
    this.view = view;
    this.viewChange.emit(this.view);
  }

  setMode(phase: NeuralNetworkPhase) {
    const storageService = this.storageSelectorService.getService(phase);
    const component = this.phaseComponentSelectorService.getComponent(phase);

    const initParams = { options: { component, proceedCondition: storageService.hasSamples } } ;
    const modalRef = this.modalService.show(PhaseModalComponent, { class: 'default-modal', backdrop: 'static', initialState: initParams});
    modalRef.content.proceed.subscribe(() => {
      this.mode = phase;
      this.neuralNetworkService.setStorage(storageService);

      this.modeChange.emit(this.mode);
    });
  }

  async backToConfig() {
    const result = await this.dialogService.question('Question', 'Current neural network configuration will be discarded. Are you sure, you want to preceed?');
    if (result === DialogResult.YES) {
      this.router.navigate(['/config']);
    }
  }
}
