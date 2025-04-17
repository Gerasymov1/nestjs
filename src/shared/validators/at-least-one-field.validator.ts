import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const fields = args.constraints[0] as string[];
    const object = args.object as Record<string, any>;

    return fields.some((field) => {
      const value = object[field];
      return value !== undefined && value !== null;
    });
  }

  defaultMessage(args: ValidationArguments) {
    const fields = args.constraints[0] as string[];
    return `At least one of the following fields must be provided: ${fields.join(', ')}`;
  }
}

export function AtLeastOneField(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (constructor: Function) {
    registerDecorator({
      name: 'AtLeastOneField',
      target: constructor,
      propertyName: '__class__',
      options: validationOptions,
      constraints: [fields],
      validator: AtLeastOneFieldConstraint,
    });
  };
}
