import { HttpClient } from '@angular/common/http';
import { Spied } from '../utility/utility-types';

export const httpClientStub = jasmine.createSpyObj('HttpClient', ['get', 'post', 'delete']) as Spied<HttpClient>;
