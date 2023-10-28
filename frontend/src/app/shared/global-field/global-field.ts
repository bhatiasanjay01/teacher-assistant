type HyperFieldProps = {
  name: string;
};

export class GlobalField {
  name: string = '';
  static of({ name }: HyperFieldProps): GlobalField {
    const field = new GlobalField();
    field.name = name;
    return field;
  }
}
