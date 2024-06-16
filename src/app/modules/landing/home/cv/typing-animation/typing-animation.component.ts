import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, map, take, tap } from 'rxjs';

@Component({
  selector: 'app-typing-animation',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './typing-animation.component.html',
  styles: `
  .typing-container {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  border-right: 0.15em solid black; /* The cursor */
  animation: blink-caret 0.75s step-end infinite;
}

@keyframes blink-caret {
  from,
  to {
    border-color: transparent;
  }
  50% {
    border-color: black;
  }
}

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypingAnimationComponent  {
    @Input() text: string = '';
    displayedText: string = '';
    currentIndex: number = 0;

    readonly text$ =  interval(100).pipe(
        take(this.text.length),
        map(e => {
            this.displayedText += this.text.charAt(this.currentIndex);
            this.currentIndex++;

            return this.displayedText;
        }),
        tap(e => console.warn(e)),
    );
}
