import Konva from 'konva';

export class ListNode {
  value: Konva.Line;
  next: ListNode;
  previous: ListNode;

  constructor(value: Konva.Line) {
    this.value = value;
    this.next = null;
    this.previous = null;
  }
}

export class TickLinkedList {
  head: ListNode;
  tail: ListNode;
  length = 1;

  constructor(value: Konva.Line) {
    this.head = {
      value,
      next: null,
      previous: null
    };
    this.tail = this.head;
  }

  // Insert node at end of the list
  append(value: Konva.Line): void {
    const newNode = new ListNode(value);

    this.tail.next = newNode;
    newNode.previous = this.tail;
    this.tail = newNode;
    this.length++;
  }

  // Insert node at the start of the list
  prepend(value: Konva.Line): void {
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

  private _destroyTick(tick: Konva.Line): void {
    (tick.getAttr('timeMark') as Konva.Text)?.destroy();
    tick.destroy();
  }
}
