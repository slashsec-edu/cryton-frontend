import { TestBed } from '@angular/core/testing';
import { TemplateService } from 'src/app/services/template.service';
import { Spied } from 'src/app/testing/utility/utility-types';
import { TemplateConverterService } from './template-converter.service';
import {
  basicTemplateDepGraph,
  basicTemplateDescription
} from 'src/app/testing/mockdata/cryton-templates/basic-template';
import { httpTemplateDepGraph, httpTemplateDescription } from 'src/app/testing/mockdata/cryton-templates/http-template';
import {
  advancedTemplateDepGraph,
  advancedTemplateDescription
} from 'src/app/testing/mockdata/cryton-templates/advanced-template';
import { DependencyGraphManagerService } from './dependency-graph-manager.service';
import { TemplateTimeline } from '../classes/timeline/template-timeline';
import { TemplateCreatorStateService } from './template-creator-state.service';
import { DependencyGraph } from '../classes/dependency-graph/dependency-graph';
import { NodeType } from '../models/enums/node-type';
import { parse } from 'yaml';
import { TemplateDescription } from '../models/interfaces/template-description';
import { GraphComparator } from 'src/app/testing/utility/graph-comparator';

class StateServiceFake {
  name = {
    value: ''
  };
  owner = {
    value: ''
  };

  timeline: TemplateTimeline;

  templateForm = {
    get: (control: 'name' | 'owner') => {
      if (control === 'name') {
        return this.name;
      } else {
        return this.owner;
      }
    },
    setValue: (value: Record<string, string>) => {
      this.name.value = value['name'];
      this.owner.value = value['owner'];
    }
  };

  reset(): void {
    this.name.value = '';
    this.owner.value = '';
    this.timeline = null;
  }
}

describe('TemplateConverterService', () => {
  let service: TemplateConverterService;

  const templateServiceStub = jasmine.createSpyObj('TemplateService', ['getTemplateDetail']) as Spied<TemplateService>;

  const graphManagerStub = jasmine.createSpyObj('DependencyGraphManagerService', [
    'getCurrentGraph',
    'resetCurrentGraph',
    'removeDispenserNode',
    'addDispenserNode'
  ]) as Spied<DependencyGraphManagerService>;

  const stateServiceFake = new StateServiceFake();

  const getNameAndOwner = (description: string): { name: string; owner: string } => {
    const templateDescription = parse(description) as TemplateDescription;
    return { name: templateDescription.plan.name, owner: templateDescription.plan.owner };
  };

  const runTemplateTests = (depGraph: DependencyGraph, description: string): void => {
    it('should correctly export basic template', () => {
      graphManagerStub.getCurrentGraph.and.returnValue({ value: depGraph });

      const nameAndOnwer = getNameAndOwner(description);
      stateServiceFake.templateForm.setValue({ name: nameAndOnwer.name, owner: nameAndOnwer.owner });

      const templateYAML = service.exportYAMLTemplate();

      expect(templateYAML).toEqual(description);
    });

    it('should correctly import basic template', () => {
      const testingDepGraph = new DependencyGraph(NodeType.CRYTON_STAGE);
      graphManagerStub.getCurrentGraph.and.returnValue({ value: testingDepGraph });

      service.importYAMLTemplate(description);

      const nameAndOnwer = getNameAndOwner(description);

      expect(stateServiceFake.name.value).toEqual(nameAndOnwer.name);
      expect(stateServiceFake.owner.value).toEqual(nameAndOnwer.owner);

      expect(GraphComparator.compareGraphs(depGraph, testingDepGraph)).toBeTrue();
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TemplateService, useValue: templateServiceStub },
        { provide: DependencyGraphManagerService, useValue: graphManagerStub },
        { provide: TemplateCreatorStateService, useValue: stateServiceFake }
      ]
    });
    service = TestBed.inject(TemplateConverterService);

    graphManagerStub.getCurrentGraph.and.returnValue(null);
    stateServiceFake.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Basic template tests', () => {
    runTemplateTests(basicTemplateDepGraph, basicTemplateDescription);
  });

  describe('HTTP listener template tests', () => {
    runTemplateTests(httpTemplateDepGraph, httpTemplateDescription);
  });

  describe('Advanced template tests', () => {
    runTemplateTests(advancedTemplateDepGraph, advancedTemplateDescription);
  });
});
