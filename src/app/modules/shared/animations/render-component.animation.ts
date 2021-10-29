import { animation, style, animate, trigger, useAnimation, transition } from '@angular/animations';

export const renderComponentAnimation = animation([
  style({ opacity: 0, transform: 'translateY(20px)' }),
  animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0px)' }))
]);

export const derenderComponentAnimation = animation([
  style({ opacity: 1, transform: 'translateY(0px)' }),
  animate('400ms ease-out', style({ opacity: 0, transform: 'translateY(20px)' }))
]);

export const renderComponentTrigger = trigger('renderTrigger', [
  transition(':enter', [useAnimation(renderComponentAnimation)]),
  transition(':leave', [useAnimation(derenderComponentAnimation)])
]);
