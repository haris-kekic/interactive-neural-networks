import { Directive, Input, ElementRef, Renderer2, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appMoveAnimation]'
})
export class MoveAnimationDirective implements OnChanges {
  @Input() moveAnimation: boolean;
  @Input() targetX: number;
  @Input() targetY: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.moveAnimation) {
      this.el.nativeElement.setAttribute('transform', `translate(${this.targetX} ${this.targetY}`);
    }
    else {
      this.el.nativeElement.setAttribute('transform', '');
    }
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}

}
