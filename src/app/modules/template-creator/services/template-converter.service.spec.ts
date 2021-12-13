import { TestBed } from '@angular/core/testing';
import { TemplateService } from 'src/app/services/template.service';
import { Spied } from 'src/app/testing/utility/utility-types';
import { TemplateConverterService } from './template-converter.service';
import {
  basicTemplateDepTree,
  basicTemplateDescription
} from 'src/app/testing/mockdata/cryton-templates/basic-template';
import { httpTemplateDepTree, httpTemplateDescription } from 'src/app/testing/mockdata/cryton-templates/http-template';
import {
  advancedTemplateDepTree,
  advancedTemplateDescription
} from 'src/app/testing/mockdata/cryton-templates/advanced-template';
import { DependencyTreeManagerService } from './dependency-tree-manager.service';
import { TemplateTimeline } from '../classes/timeline/template-timeline';
import { TemplateCreatorStateService } from './template-creator-state.service';
import { DependencyTree } from '../classes/dependency-tree/dependency-tree';
import { NodeType } from '../models/enums/node-type';
import { parse } from 'yaml';
import { TemplateDescription } from '../models/interfaces/template-description';
import { TreeComparator } from 'src/app/testing/utility/tree-comparator';

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

  const treeManagerStub = jasmine.createSpyObj('DependencyTreeManagerService', [
    'getCurrentTree',
    'resetCurrentTree',
    'removeDispenserNode',
    'addDispenserNode'
  ]) as Spied<DependencyTreeManagerService>;

  const stateServiceFake = new StateServiceFake();

  const getNameAndOwner = (description: string): { name: string; owner: string } => {
    const templateDescription = parse(description) as TemplateDescription;
    return { name: templateDescription.plan.name, owner: templateDescription.plan.owner };
  };

  const runTemplateTests = (depTree: DependencyTree, description: string): void => {
    it('should correctly export basic template', () => {
      treeManagerStub.getCurrentTree.and.returnValue({ value: depTree });

      const nameAndOnwer = getNameAndOwner(description);
      stateServiceFake.templateForm.setValue({ name: nameAndOnwer.name, owner: nameAndOnwer.owner });

      const templateYAML = service.exportYAMLTemplate();

      expect(templateYAML).toEqual(description);
    });

    it('should correctly import basic template', () => {
      const testingDepTree = new DependencyTree(NodeType.CRYTON_STAGE);
      treeManagerStub.getCurrentTree.and.returnValue({ value: testingDepTree });

      service.importYAMLTemplate(description);

      const nameAndOnwer = getNameAndOwner(description);

      expect(stateServiceFake.name.value).toEqual(nameAndOnwer.name);
      expect(stateServiceFake.owner.value).toEqual(nameAndOnwer.owner);

      expect(TreeComparator.compareTrees(depTree, testingDepTree)).toBeTrue();
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TemplateService, useValue: templateServiceStub },
        { provide: DependencyTreeManagerService, useValue: treeManagerStub },
        { provide: TemplateCreatorStateService, useValue: stateServiceFake }
      ]
    });
    service = TestBed.inject(TemplateConverterService);

    treeManagerStub.getCurrentTree.and.returnValue(null);
    stateServiceFake.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Basic template tests', () => {
    runTemplateTests(basicTemplateDepTree, basicTemplateDescription);
  });

  describe('HTTP listener template tests', () => {
    runTemplateTests(httpTemplateDepTree, httpTemplateDescription);
  });

  describe('Advanced template tests', () => {
    runTemplateTests(advancedTemplateDepTree, advancedTemplateDescription);
  });
});
