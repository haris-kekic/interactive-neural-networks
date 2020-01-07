import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'nn-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.css']
})
export class NumberInputComponent implements OnInit {

  @Input() emptyDefault: number;
  @Input() step: number;
  @Input() value: number;
  @Output() valueChange = new EventEmitter<number>();

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
    }
    this.change.next(this.value);
  }

}
