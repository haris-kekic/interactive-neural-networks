import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { NeuralNetworkService, PropagationOptions } from 'src/app/core/services/neural-network.service';
import { Subject, merge } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DialogService } from 'src/app/core/services/dialog.service';
import { DialogResult } from '../dialog-modal/dialog-modal.component';


@Component({
  selector: 'nn-nav-panel',
  templateUrl: './nav-panel.component.html',
  styleUrls: ['./nav-panel.component.scss']
})
export class NavPanelComponent implements OnInit {
  public delay = 1;
  readonly msDisableDelay = 1500;

  private propagationOptions: PropagationOptions;

  disablePlay: boolean;
  playing: boolean;

  constructor(protected neuralNetworkService: NeuralNetworkService,
              protected dialogService: DialogService) { }

  ngOnInit() {
    this.neuralNetworkService.propagationStop
                .pipe(delay(this.msDisableDelay))
                .subscribe(() => {
                  this.disablePlay = false;
                  this.playing = false;
                } );
  }

  performStop() {
    this.neuralNetworkService.stopPropagation();
  }

  performPlay() {
    this.propagationOptions = { delay: this.delayToMilliseconds, isContinous: true };
    this.neuralNetworkService.propagate(this.propagationOptions);
    this.disablePlay = true;
    this.playing = true;
  }

  performForward() {

  }


  performFastForward() {

  }

  perfromStep() {
    this.propagationOptions = { delay: 0, isContinous: false };
    this.neuralNetworkService.propagate(this.propagationOptions);
    this.disablePlay = true;
    this.playing = true;
    setTimeout(() => this.neuralNetworkService.stopPropagation());
  }

  setDelay() {
    this.delay *= 2;
    if (this.delay > 4) {
      this.delay = 1;
    }

    this.propagationOptions.delay = this.delayToMilliseconds;
  }

  @HostListener('window:blur', ['$event'])
  async onBlur(event: any) {
    // If the browser is inactive, the there are a lot of problems with timers which do not work properly in background
    // and race conditions on animation start to appear. This is why we stop the execution if the user moves away.
    if (this.playing) {
      this.performStop();
      const result = await this.dialogService.question('Question', 'Execution automatically stops, if navigated away. Do you want to continue?');
      if (result === DialogResult.YES) {
        this.performPlay();
      }
    }
  }

  get delayToMilliseconds() { return 1800 * this.delay; }
}
