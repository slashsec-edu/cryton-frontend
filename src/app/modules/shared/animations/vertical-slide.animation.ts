import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';

export const DEFAULT_SLIDE_DURATION = 500;

export const verticalSlideAnimation = (duration = DEFAULT_SLIDE_DURATION): AnimationTriggerMetadata =>
  trigger('verticalSlide', [
    state(
      'shifted',
      style({
        transform: `translateY(-100%)`
      })
    ),
    state(
      'not-shifted',
      style({
        transform: 'translateY(0px)'
      })
    ),
    transition('shifted <=> not-shifted', animate(`${duration}ms ease`)),
    transition('shifted => void', animate(`${duration}ms ease`, style({ transform: `translateY(-100%)` }))),
    transition('not-shifted => void', animate(`${duration}ms ease`, style({ transform: `translateY(0px)` })))
  ]);
