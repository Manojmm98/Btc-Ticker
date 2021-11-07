
// action for clearing asked order

function clearAsksOrderBook(newAsksData) {
  return {
    type: 'CLEAR_ASKS',
    newAsksData: []
  }
}
export default clearAsksOrderBook;