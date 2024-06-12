import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Pipe({
    name: 'toMap',
    standalone: true,
})
export class ToMapPipe implements PipeTransform {
    transform(value: any[], key: string): any {
        return value.map(e => e[key]);
    }
}
