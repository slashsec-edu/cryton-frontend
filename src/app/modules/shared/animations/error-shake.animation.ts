import { animation, style, animate, keyframes } from '@angular/animations';

export const errorShakeAnimation = animation([
  animate(
    '1s ease-out',
    keyframes([
      style({ transform: 'rotate(-3deg)', offset: 0.1 }),
      style({
        background: '#d50027',
        transform: 'rotate(3deg)',
        color: 'white',
        offset: 0.2
      }),
      style({ transform: 'rotate(-3deg)', offset: 0.3 }),
      style({ transform: 'rotate(3deg)', offset: 0.4 }),
      style({
        transform: 'rotate(0deg)',
        background: '#d8d8d8',
        color: 'gray',
        offset: 1
      })
    ])
  )
]);
