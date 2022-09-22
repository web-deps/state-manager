interface CollectionStateEventInterface<CollectionStateManagerInterface> {
  name: string;
  subject: CollectionStateManagerInterface;
  combination: Array<string>;
}

class CollectionStateEvent<CollectionStateManagerInterface>
  implements CollectionStateEventInterface<CollectionStateManagerInterface>
{
  public readonly name: string;
  public readonly subject: CollectionStateManagerInterface;
  public readonly combination: Array<string>;

  constructor(
    name: string,
    subject: CollectionStateManagerInterface,
    combination: Array<string>
  ) {
    this.name = name;
    this.subject = subject;
    this.combination = combination;
  }
}

export default CollectionStateEvent;
export type { CollectionStateEventInterface };
