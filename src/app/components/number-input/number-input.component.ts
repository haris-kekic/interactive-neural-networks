import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'nn-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.css']
})
export class NumberInputComponent implements OnInit {
  @Input() emptyDefault: number;
  @Input() minValue: number;
  @Input() maxValue: number;
  @Input() step: number;
  @Input() value: number;
  @Output() valueChange = new EventEmitter<number>();
  @ViewChild('inputcontrol', { static: true }) inputControl: ElementRef;

  change = new Subject<number>();

  constructor() { }

  ngOnInit() {
    this.change
    .pipe(debounceTime(500), distinctUntilChanged())
    .subscribe(value => {
      this.valueChange.next(value);
    });
  }

  onValueChange(value: number) {
    this.value = value;
    if (this.value === null) {
      this.value = this.emptyDefault;
    } else if (this.value > this.maxValue) {
      this.value = this.maxValue;
    } else if (this.value < this.minValue) {
      this.value = this.minValue;
    }
    this.change.next(this.value);
  }

  onKeyUp() {
    const value = Number(this.inputControl.nativeElement.value);
    if (isNaN(value)) {
      this.value = this.emptyDefault;
      this.inputControl.nativeElement.value = this.value;
    } else if (value > this.maxValue) {
      this.value = this.maxValue;
      this.inputControl.nativeElement.value = this.value;
    } else if (value < this.minValue) {
      this.value = this.minValue;
      this.inputControl.nativeElement.value = this.value;
    }
  }

}
