/**
 * @dev Define the timestamp extended entity.
 */
export class TimestampEntity {
  /**
   * @dev Define the document id.
   */
  _id: string;

  /**
   * @dev The time that the entity was created at.
   */
  createdAt: string;

  /**
   * @dev The time that the entity was updated at.
   */
  updatedAt: string;
}
