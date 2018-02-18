/**
 * A connector needs at least one property in a row so it has a unique identifier of a row.
 */
export default class AttributesConnector {
  parseRow (row) {
    return {
      weight: parseInt(row.dataset.weight),
      depth: parseInt(row.dataset.depth)
    }
  }
}