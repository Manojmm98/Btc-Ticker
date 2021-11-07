
// this action is for clearing bids order


function clearBidsOrderBook(newBidsData) {
  return {
    type: 'CLEAR_BIDS',
    newBidsData: []
  }
}
export default clearBidsOrderBook;