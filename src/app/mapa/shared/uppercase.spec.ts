import { UppercaseDirective } from './uppercase.directive';
import { ElementRef } from '@angular/core';

describe('UppercaseDirective', () => {
  it('should create an instance', () => {
    const inputEl = document.createElement('input');       // input de prueba
    const elementRef = new ElementRef(inputEl);            // ElementRef simulado
    const directive = new UppercaseDirective(elementRef);  // ✅ pasamos argumento

    expect(directive).toBeTruthy();
  });
});
