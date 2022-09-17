interface DataStateEventInterface<DataStateManagerInterface, DataType> {
  name: string;
  dataStateManager: DataStateManagerInterface;
  data: DataType;
}

class DataStateEvent<DataStateManagerInterface, DataType>
  implements DataStateEventInterface<DataStateManagerInterface, DataType>
{
  public readonly name: string;
  public readonly dataStateManager: DataStateManagerInterface;
  public readonly data: DataType;

  constructor(
    name: string,
    dataStateManager: DataStateManagerInterface,
    data: DataType
  ) {
    this.name = name;
    this.dataStateManager = dataStateManager;
    this.data = data;
  }
}

export default DataStateEvent;
export type { DataStateEventInterface };
