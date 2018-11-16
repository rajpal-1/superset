import FormData from './FormData';

enum DatasourceType {
  Table = 'table',
  Druid = 'druid',
}

export interface DatasourceKey {
  id: number;
  type: DatasourceType;
}

// Declaration merging with the interface above. No need to redeclare id and type.
export class DatasourceKey {
  constructor(key: string) {
    const [ idStr, typeStr ] = key.split('__');
    this.id = parseInt(idStr, 10);
    this.type = typeStr === 'table' ? DatasourceType.Table : DatasourceType.Druid;
  }

  public toString() {
    return `${this.id}__${this.type}`;
  }

  public toObject() {
    return {
      id: this.id,
      type: this.type,
    };
  }
}

export default function buildDatasource(formData: FormData) {
  return new DatasourceKey(formData.datasource).toObject();
}
