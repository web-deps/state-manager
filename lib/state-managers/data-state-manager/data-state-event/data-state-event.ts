interface DataStateEventInterface<DataStateManagerInterface, DataType> {
  name: string;
  subject: DataStateManagerInterface;
  data: DataType;
}

class DataStateEvent<DataStateManagerInterface, DataType>
  implements DataStateEventInterface<DataStateManagerInterface, DataType>
{
  public readonly name: string;
  public readonly subject: DataStateManagerInterface;
  public readonly data: DataType;

  constructor(
    name: string,
    subject: DataStateManagerInterface,
    data: DataType
  ) {
    this.name = name;
    this.subject = subject;
    this.data = data;
  }
}

export default DataStateEvent;
export type { DataStateEventInterface };
