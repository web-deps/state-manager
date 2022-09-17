interface CollectionStateEventInterface<CollectionStateManagerInterface> {
  name: string;
  collectionStateManager: CollectionStateManagerInterface;
  combination: Array<string>;
}

class CollectionStateEvent<CollectionStateManagerInterface>
  implements CollectionStateEventInterface<CollectionStateManagerInterface>
{
  public readonly name: string;
  public readonly collectionStateManager: CollectionStateManagerInterface;
  public readonly combination: Array<string>;

  constructor(
    name: string,
    collectionStateManager: CollectionStateManagerInterface,
    combination: Array<string>
  ) {
    this.name = name;
    this.collectionStateManager = collectionStateManager;
    this.combination = combination;
  }
}

export default CollectionStateEvent;
export type { CollectionStateEventInterface };
