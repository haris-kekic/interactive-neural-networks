import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnDestroy, OnChanges } from '@angular/core';
import {
  Sample,
  NeuralNetworkService
} from 'src/app/core/services/neural-network.service';
import { TestSampleStorageService } from 'src/app/core/services/sample-storage.service';
import { Observable, Subject, timer } from 'rxjs';
import { ParsingService } from 'src/app/core/services/parsing.service';
import { ViewBaseComponent } from '../view-base/view-base.component';
import { ToastrService } from 'ngx-toastr';
import { Converter } from 'src/app/core/utils/converter';
import {
  debounceTime,
  distinctUntilChanged,
  elementAt,
  tap
} from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'nn-config-execution',
  templateUrl: './config-execution.component.html',
  styleUrls: ['./config-execution.component.scss']
})
export class ConfigExecutionComponent extends ViewBaseComponent
  implements OnInit, OnDestroy, OnChanges {
  // we dont use input binding in config because this component needs to be used later in a modal
  // and there we dont have access to the previous configuration step in wizard
  @Input() private activated: boolean;
  @Input() private save!: EventEmitter<any>;

  constructor(protected router: Router) {
    super();
  }

  ngOnInit() {
    if (this.save) {
      this.save.subscribe(() => { });
    }

    timer(3000).subscribe(() => this.router.navigate(['/view']));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activated) {

    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
