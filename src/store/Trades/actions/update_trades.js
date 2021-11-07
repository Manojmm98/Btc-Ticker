// this action is for updating the traders

function updateTrades(newTradesData) {
  return {
    type: 'UPDATE_TRADES',
    newTradesData: newTradesData
  }
}
export default updateTrades;