export interface ISchema {
  properties: {
    [key: string]: {
      type: string | string[];
    };
  };
  required?: string[];
}
