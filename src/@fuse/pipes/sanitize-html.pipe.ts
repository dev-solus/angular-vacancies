import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Pipe({
  name: 'sanitizeHtml',
  standalone: true,
})
export class SanitizeHtml implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(v: string): SafeHtml {
    // v = v
    //   .replace('<img', '<img style="width: 100%;"')
    //   ;

    //console.log(v, this.sanitizer.bypassSecurityTrustHtml(v))

    return this.sanitizer.bypassSecurityTrustHtml(v);
  }
}

// @NgModule({
//   declarations: [SanitizeHtml],
//   imports: [
//     CommonModule,
//   ],
//   exports: [
//     SanitizeHtml,
//   ]
// })
// export class SanitizeHtmlModule { }
