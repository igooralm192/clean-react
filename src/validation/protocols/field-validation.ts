export interface FieldValidation {
  name: string
  validate: (value: string) => Error
}
