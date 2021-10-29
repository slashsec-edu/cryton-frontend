import { trigger, style, transition, animate } from '@angular/animations';

export const toggleAnimation = trigger('open', [
  transition(':enter', [style({ height: '0' }), animate('0.5s ease', style({ height: '*' }))]),
  transition(':leave', [style({ height: '*' }), animate('0.5s ease', style({ height: '0' }))])
]);
