import { Component, OnInit } from '@angular/core';
import { InstanceService } from 'src/app/services/instance.service';
import { InstanceTableDataSource } from 'src/app/models/data-sources/instance-table.data-source';
import { Instance } from 'src/app/models/api-responses/instance.interface';
import { Observable, of } from 'rxjs';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';

@Component({
  selector: 'app-instances-dashboard',
  templateUrl: './instances-dashboard.component.html'
})
export class InstancesDashboardComponent implements OnInit {
  dataSource: InstanceTableDataSource;
  buttons = [{ icon: 'settings', func: this.handleSettings }];
  searchValue = '';

  constructor(private _instanceService: InstanceService, private _datePipe: CrytonDatetimePipe) {}

  ngOnInit(): void {
    this.dataSource = new InstanceTableDataSource(this._instanceService, this._datePipe);
  }

  handleSettings(instance: Instance): Observable<string> {
    console.log(instance);
    return of(null) as Observable<string>;
  }
}
