import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UppercaseDirective } from './uppercase.directive';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UppercaseDirective // 1. ¡Importa la directiva aquí!
  ],
  exports:[
    UppercaseDirective // 2. Exporta la directiva para que otros módulos puedan usarla
  ]
})
export class SharedModule { }
