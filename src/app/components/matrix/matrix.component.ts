import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'nn-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.css']
})
export class MatrixComponent implements OnChanges {
  @Input() matrix: number[][];
  @Input() layer: number;
  @Input() hasColHeader = true;
  @Input() hasRowHeader = true;

  ngOnChanges() {

  }

}
