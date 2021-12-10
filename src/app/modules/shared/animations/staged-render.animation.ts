import {
  trigger,
  transition,
  query,
  style,
  stagger,
  useAnimation,
  AnimationTriggerMetadata
} from '@angular/animations';
import { renderComponentAnimation } from './render-component.animation';

export const stagedRenderTrigger = (itemClass: string): AnimationTriggerMetadata =>
  trigger('renderTrigger', [
    transition('loading => loaded', [
      query(
        itemClass,
        [style({ opacity: 0, transform: 'translateY(20px)' }), stagger(30, [useAnimation(renderComponentAnimation)])],
        { optional: true }
      )
    ])
  ]);
