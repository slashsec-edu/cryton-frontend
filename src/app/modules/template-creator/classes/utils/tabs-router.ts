import { Subject } from 'rxjs';

export enum Tabs {
  BUILD_TEMPLATE,
  CREATE_STAGE,
  CREATE_STEP
}

export class TabsRouter {
  static selectIndex$ = new Subject<number>();

  constructor() {}

  static selectIndex(tab: Tabs): void {
    this.selectIndex$.next(tab);
  }
}
