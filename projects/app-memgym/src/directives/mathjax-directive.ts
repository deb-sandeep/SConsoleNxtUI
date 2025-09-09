import { Directive, ElementRef, Input, OnChanges } from "@angular/core";

@Directive({ selector: '[mathjax]' })
export class MathjaxDirective implements OnChanges {
    @Input('mathjax') content = '';
    constructor(private el: ElementRef<HTMLElement>) {}
    ngOnChanges() {
        this.el.nativeElement.innerHTML = this.content ?? '';
        queueMicrotask(() => (window as any).MathJax?.typesetPromise?.([this.el.nativeElement]));
    }
}
