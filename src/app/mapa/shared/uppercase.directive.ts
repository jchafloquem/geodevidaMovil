import { Directive, HostListener, ElementRef } from '@angular/core';
import { IonInput } from '@ionic/angular';

@Directive({
  selector: '[appUppercase]',
  standalone: true,
})
export class UppercaseDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  async onInputChange(event: any) {
    const ionInput = this.el.nativeElement as IonInput;
    const inputElement = await ionInput.getInputElement();

    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;

    const newValue = inputElement.value?.toUpperCase() || '';

    inputElement.value = newValue;
    inputElement.setSelectionRange(start, end);

    ionInput.value = newValue;
    event.stopImmediatePropagation();
  }
}