import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, AfterContentInit, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { Observable } from 'rxjs';

export interface PhaseModalOptions {
  component: any;
  proceedCondition: Observable<boolean>;
}

export interface PhaseModalResult {
  component: any;
  proceedCondition: Observable<boolean>;
}

@Component({
  selector: 'nn-phase-modal',
  templateUrl: './phase-modal.component.html',
  styleUrls: ['./phase-modal.component.css']
})
export class PhaseModalComponent implements OnInit, AfterContentInit {

  options: PhaseModalOptions;

  @ViewChild('childcontainer', { read: ViewContainerRef, static: true }) entry: ViewContainerRef;

  proceed: EventEmitter<any> = new EventEmitter();

  constructor(public resolver: ComponentFactoryResolver,
              public bsModalRef: BsModalRef) {}

  ngOnInit() {

    this.options.proceedCondition.subscribe((result) => {
      console.log('has samples: ' + result);
    });
  }

  ngAfterContentInit(): void {
    if (this.options.component === null) {
      throw Error('No component defined for phase modal!');
    }

    const componentFactory = this.resolver.resolveComponentFactory(this.options.component);
    const componentObj = this.entry.createComponent(componentFactory) as any;
    componentObj.instance.save = this.proceed;
  }

}
