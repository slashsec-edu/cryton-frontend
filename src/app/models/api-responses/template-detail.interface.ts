import { TemplateDescription } from 'src/app/modules/template-creator/models/interfaces/template-description';

export interface TemplateDetail {
  detail: {
    template_model_id: string;
    template: TemplateDescription;
  };
}
