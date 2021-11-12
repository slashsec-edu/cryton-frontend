import Konva from 'konva';
import { Tick } from 'src/app/modules/shared/classes/tick';

export class ListNode {
  value: Tick;
  next: ListNode;
  previous: ListNode;

  constructor(value: Tick) {
    this.value = value;
    this.next = null;
    this.previous = null;
  }
}

export class TickLinkedList {
  head: ListNode;
  tail: ListNode;
  length = 1;

  constructor(value: Tick) {
    this.head = {
      value,
      next: null,
      previous: null
    };
    this.tail = this.head;
  }

  // Insert node at end of the list
  append(value: Tick): void {
    const newNode = new ListNode(value);

    this.tail.next = newNode;
    newNode.previous = this.tail;
    this.tail = newNode;
    this.length++;
  }

  // Insert node at the start of the list
  prepend(value: Tick): void {
    const newNode = new ListNode(value);

    newNode.next = this.head;
    this.head.previous = newNode;
    this.head = newNode;
    this.length++;
  }

  destroyHead(): void {
    if (this.length === 1) {
      throw new Error(`Can't destroy the only element.`);
    }

    const head = this.head;
    this.head = this.head.next;
    this._destroyTick(head.value);
    this.length--;
  }

  destroyTail(): void {
    if (this.length === 1) {
      throw new Error(`Can't destroy the only element.`);
    }

    const tail = this.tail;
    this.tail = this.tail.previous;
    this._destroyTick(tail.value);
    this.length--;
  }

  private _destroyTick(tick: Tick): void {
    (tick.getAttr('timeMark') as Konva.Text)?.destroy();
    tick.destroy();
  }
}
