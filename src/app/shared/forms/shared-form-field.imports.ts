import { FieldValueStateDirective } from '../directives/field-value-state.directive';
import { NumericInputPlaceholderDirective } from '../directives/numeric-input-placeholder.directive';

export const SHARED_FORM_FIELD_DIRECTIVES = [
  FieldValueStateDirective,
  NumericInputPlaceholderDirective,
] as const;
