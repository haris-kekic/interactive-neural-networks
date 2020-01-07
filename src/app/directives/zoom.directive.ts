import { Directive, ElementRef, HostListener, Renderer2, AfterViewInit } from '@angular/core';

import * as SvgPanZoom from 'svg-pan-zoom';

@Directive({
  selector: '[nnZoom]'
})
export class ZoomDirective implements AfterViewInit {
  ngAfterViewInit(): void {
    const panZoom = SvgPanZoom(this.el.nativeElement, { zoomScaleSensitivity: 0.3, maxZoom: 20 });
    panZoom.fit();
    panZoom.zoom(0.98);
    panZoom.center();

  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}
}
