import { Component, Input } from '@angular/core';
import { displayImageCore } from 'environments/environment.development';

@Component({
  selector: 'my-image',
  standalone: true,
  imports: [],
  template: `
  <img [src]="displayImageCore(src)" [class]="class" [alt]="alt ?? src" onerror="src='assets/images/logo/logo.png'">
  `,
})
export class MyImageComponent {
    displayImageCore = displayImageCore;
  @Input({required: true}) src: string;
  @Input({required: false}) class = 'w-20';
  @Input({required: false}) alt: string;
}
