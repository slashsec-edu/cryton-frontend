import {
  Component,
  OnInit,
  Input,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter,
  OnDestroy,
  Type,
  ViewChildren,
  QueryList,
  ComponentFactoryResolver,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { tap, takeUntil } from 'rxjs/operators';
import { HasID } from 'src/app/models/cryton-table/interfaces/has-id.interface';
import { Column } from 'src/app/models/cryton-table/interfaces/column.interface';
import { Button } from 'src/app/models/cryton-table/interfaces/button.interface';
import { LinkButton } from 'src/app/models/cryton-table/interfaces/link-button.interface';
import { TableFilter } from 'src/app/models/cryton-table/interfaces/table-filter.interface';
import { Observable, Subject } from 'rxjs';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { ExpandedRowInterface } from 'src/app/generics/expanded-row.interface';
import { Sort } from '@angular/material/sort';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { CrytonTableDataSource } from 'src/app/generics/cryton-table.datasource';
import { SelectionModel } from '@angular/cdk/collections';

export interface ErroneousButton<T> {
  button: Button<T>;
  row: T;
}

export const RELOAD_TIMEOUT = 500;

@Component({
  selector: 'app-cryton-table',
  templateUrl: './cryton-table.component.html',
  styleUrls: ['./cryton-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
    trigger('error', [
      transition('noError => error', [
        animate(
          '1s ease-out',
          keyframes([
            style({ transform: 'rotate(-3deg)', offset: 0.1 }),
            style({ transform: 'rotate(3deg)', color: '#ff5543', offset: 0.2 }),
            style({ transform: 'rotate(-3deg)', offset: 0.3 }),
            style({ transform: 'rotate(3deg)', offset: 0.4 }),
            style({ transform: 'rotate(0deg)', color: '*', offset: 1 })
          ])
        )
      ])
    ]),
    trigger('expand', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('expanded <=> collapsed', animate('225ms ease'))
    ])
  ]
})
export class CrytonTableComponent<T extends HasID> implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChildren(ComponentInputDirective)
  expandedHosts: QueryList<ComponentInputDirective>;

  /**
   * Main table settings and data source.
   */
  @Input() dataSource: CrytonTableDataSource<T>;

  /**
   * Title displayed in the table header.
   */
  @Input() header: string;

  /**
   * Create button data.
   */
  @Input() createButton: LinkButton;

  /**
   * Optional buttons to be displayed at the end of each row.
   */
  @Input() buttons?: Button<T>[];

  /**
   * Specifies if table should display radio buttons.
   */
  @Input() showRadioButtons?: boolean;

  /**
   * Specifies if table should display checkboxes.
   */
  @Input() showCheckboxes?: boolean;

  /**
   * Specifies if table should hide page size options.
   */
  @Input() hidePageSize?: boolean;

  /**
   * Specifies maximal length of a string in the table row.
   */
  @Input() maxStringLength = 15;

  /**
   * Observable for triggering erase event by parent.
   */
  @Input() eraseEvent$?: Observable<void>;

  /**
   * Component displayed inside expanded row.
   */
  @Input() expandedComponent?: Type<ExpandedRowInterface<T>>;

  /**
   * Emits event with checked radio button on check event.
   */
  @Output() radioChange = new EventEmitter<T>();

  /**
   * Emits event with a set of checked checkboxes on check event.
   */
  @Output() checkboxChange = new EventEmitter<T[]>();

  /* PAGINATOR SETTINGS */
  pageSize = 5;

  /* TABLE SETTINGS */
  displayedColumns: string[];
  expandedRow: T;

  /* CHECKBOXES */
  checkboxSelection: SelectionModel<T>;
  radioSelection: SelectionModel<T>;

  /* FILTER SETTINGS */
  filterControl: FormControl = new FormControl('');
  columnControl: FormControl = new FormControl('');
  filterOptions: FormGroup;

  /* ERROR HANDLING */
  erroneousButton: ErroneousButton<T>;

  /* QUERY SETTINGS */
  filter: TableFilter;
  sort: string;

  /* EVENTS */
  private _destroy$ = new Subject<void>();

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _fb: FormBuilder,
    private _alertService: AlertService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkboxSelection = new SelectionModel<T>(true, []);
    this.radioSelection = new SelectionModel<T>(false);

    this.dataSource.loadItems(0, this.pageSize, this.sort, null);
    this.displayedColumns = this._getDisplayedColumns();

    if (this.eraseEvent$) {
      this.eraseEvent$.pipe(takeUntil(this._destroy$)).subscribe(() => this._uncheckAll());
    }

    this.filterOptions = this._fb.group({
      filter: this.filterControl,
      column: this.columnControl
    });

    this.filterOptions.valueChanges.pipe(takeUntil(this._destroy$)).subscribe((filter: TableFilter) => {
      this.filter = filter;
      this.loadPage();
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.paginator.page
      .pipe(
        tap(() => this.loadPage()),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  loadPage(): void {
    this._destroyExpandedRowComponents();

    this.dataSource.loadItems(
      this.paginator.pageIndex * this.paginator.pageSize,
      this.paginator.pageSize,
      this.sort,
      this.filter
    );
  }

  /**
   * Refreshes table data with a small time-out to simulate loading data even if data gets
   * loaded almost instantly.
   */
  refreshData(): void {
    this.dataSource.setLoading(true);

    setTimeout(() => {
      this.loadPage();
    }, RELOAD_TIMEOUT);
  }

  /**
   * Adds gray color or highlight to table cells based on their content.
   *
   * @param content Text content of a cell.
   * @param highlight Is cell highlightable.
   */
  getClass(content: unknown, highlight: boolean): string {
    if (content === null) {
      return 'undefined';
    }
    if (highlight && typeof content === 'string') {
      const color: string = this.dataSource.getHighlight(content.toLowerCase());
      return `highlight ${color}`;
    }
  }

  /**
   * Use display function provided in table settings on a table cell.
   * If no display function was provided, display correct parameter of a table row.
   *
   * @param row Row of a table.
   * @param columnIndex Column index of the cell.
   * @param columnName Name of the column where the cell is located.
   */
  displayCell(row: T, columnIndex: number, columnName: string): string {
    if (this.dataSource.displayFunctions && this.dataSource.displayFunctions[columnIndex]) {
      return this.dataSource.displayFunctions[columnIndex](row);
    }
    return row[columnName] as string;
  }

  getTooltip(row: T, columnIndex: number, columnName: string): string {
    const display = this.displayCell(row, columnIndex, columnName);

    return display && display.length > this.maxStringLength ? display : null;
  }

  checkRadioButton(item: T): void {
    this.radioSelection.select(item);
    this.radioChange.emit(item);
  }

  checkCheckbox(item: T): void {
    if (item) {
      this.checkboxSelection.toggle(item);
      this.checkboxChange.emit(this.checkboxSelection.selected);
    }
  }

  /**
   * Whether the number of elements with checked checkbox matches the total number of rows.
   **/
  isAllChecked(): boolean {
    const numSelected = this.checkboxSelection.selected.length;
    const numRows = this.dataSource.data.count;
    return numSelected === numRows;
  }

  /**
   * Checks all checkboxes if they are not all checked; otherwise clear selection.
   **/
  masterToggle(): void {
    if (this.isAllChecked()) {
      this.checkboxSelection.clear();
    } else {
      this.dataSource.data.items.forEach(row => this.checkboxSelection.select(row));
    }
    this.checkboxChange.emit(this.checkboxSelection.selected);
  }

  expandRow(row: T, index: number): void {
    const animationTimeout = 225;
    if (!this.expandedComponent) {
      return;
    }
    const expandedRow = this.expandedRow === row ? null : row;
    if (expandedRow) {
      this.createExpandedRowComponent(row, index);
      this.expandedRow = expandedRow;
    } else {
      this.expandedRow = expandedRow;
      setTimeout(() => this._destroyExpandedRowComponents(), animationTimeout);
    }
  }

  createExpandedRowComponent(row: T, index: number): void {
    const componentHost = this.expandedHosts.toArray()[index];
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(this.expandedComponent);
    const viewContainerRef = componentHost.viewContainerRef;

    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    const componentInstance = componentRef.instance;

    componentInstance.rowData = row;
    componentInstance.delete.pipe(takeUntil(this._destroy$)).subscribe(() => this.updatePaginator());
    componentInstance.rowUpdate.pipe(takeUntil(this._destroy$)).subscribe((updatedRow: T) => {
      this.dataSource.updateRow(updatedRow);
      this._cd.detectChanges();
    });
  }

  updatePaginator(): void {
    if (this.paginator.length > 0) {
      this.paginator.length -= 1;
    }
    const totalRows = this.paginator.length;
    const currentPage = this.paginator.pageIndex;
    const limit = this.paginator.pageSize;
    const firstItemFromPage = currentPage * limit;

    if (firstItemFromPage >= totalRows && totalRows > 0) {
      this.paginator.previousPage();
    } else {
      this.loadPage();
    }
  }

  handleButtonClick(button: Button<T>, row: T): void {
    const errorTimeout = 10;

    button
      .func(row)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (successMsg: string) => {
          if (successMsg) {
            this._alertService.showSuccess(successMsg);
          }
        },
        error: (err: string) => {
          this.erroneousButton = null;
          this._alertService.showError(err);
          setTimeout(() => (this.erroneousButton = { button, row }), errorTimeout);
        }
      });
  }

  isErroneous(button: Button<T>, row: T): boolean {
    if (!this.erroneousButton) {
      return false;
    }
    return this.erroneousButton.button === button && this.erroneousButton.row === row;
  }

  sortData(sort: Sort): void {
    if (sort.direction === '') {
      this.sort = '';
    } else if (sort.direction === 'asc') {
      this.sort = sort.active;
    } else {
      this.sort = `-${sort.active}`;
    }
    this.loadPage();
  }

  getFilterableColumns(): Column[] {
    return this.dataSource.columns.filter(column => column.filterable);
  }

  hasCheckboxXORradio(): boolean {
    return (this.showCheckboxes && !this.showRadioButtons) || (!this.showCheckboxes && this.showRadioButtons);
  }

  handleRowClick(row: T, i: number): void {
    if (this.expandedComponent) {
      this.expandRow(row, i);
    } else if (this.hasCheckboxXORradio()) {
      if (this.showCheckboxes) {
        this.checkCheckbox(row);
      } else if (this.showRadioButtons) {
        this.checkRadioButton(row);
      }
    }
  }

  private _destroyExpandedRowComponents(): void {
    this.expandedHosts.forEach(host => host.viewContainerRef.clear());
  }

  private _getDisplayedColumns(): string[] {
    const displayedColumns = this._getColumnNames(this.dataSource.columns);

    if (this.showCheckboxes) {
      displayedColumns.push('checkbox');
    }
    if (this.showRadioButtons) {
      displayedColumns.push('radio');
    }
    if (this.buttons && this.buttons.length > 0) {
      displayedColumns.push(...this.buttons.map(button => button.name));
    }
    if (this.expandedComponent) {
      displayedColumns.push('expand');
    }

    return displayedColumns;
  }

  private _uncheckAll(): void {
    this.radioSelection.clear();
    this.checkboxSelection.clear();
    this._cd.detectChanges();
  }

  private _getColumnNames(columns: Column[]): string[] {
    return [...columns.map(item => item.name)];
  }
}
