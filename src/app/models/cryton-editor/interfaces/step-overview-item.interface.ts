import { StepType } from '../enums/step-type.enum';

export interface StepOverviewItem {
  name: string;
  type: StepType;
  required: boolean;
}
