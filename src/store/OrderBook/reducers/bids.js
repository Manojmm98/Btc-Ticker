export default function (state = [], action) {
	switch (action.type) {
		case 'UPDATE_BIDS_ORDER_BOOK': 
			let newState = action.newBidsData;
			let priceExists = false;

			if (state.length > 0) {
				state.map(function(row, index){
					if (state[index].price && newState.price && (state[index].price === newState.price)) {
						//Price already exists, so it should only update current row.
						priceExists = true;
						state[index].count = newState.count;
						state[index].amount = newState.amount;
					}
				})
			}
			
			if (priceExists === true) {
				priceExists = false;
				return state.slice()
			}
			else{
					let newStateCombined = [...state, newState];
					//Sort form highest to lowest price before returning.
					newStateCombined.sort(function(a, b){
					    return b.price - a.price;
					});

                 // if length is greater than 50 then pop it

					if (newStateCombined.length > 50) {
						newStateCombined.pop();
					}

//                  if length is greater than 0 then check  if length of row is not 0 then splice

					if (newStateCombined.length > 0) {
						newStateCombined.map(function(row, index){
							if (!row || row.count === 0) {
								newStateCombined.splice(index, 1);
							}
						});

						newStateCombined.map(function(row, index){
							if (newStateCombined[index - 1] && newStateCombined[index - 1].total) {
								newStateCombined[index].total = (parseFloat(newStateCombined[index - 1].total) + parseFloat(row.amount)).toFixed(2);
							}
							else{
								newStateCombined[index].total = parseFloat(row.amount).toFixed(2);
							}
						});
					}

					return newStateCombined;
				}
			break;
			// pass the bids data
		case 'CLEAR_BIDS': 
				return action.newBidsData;
			break;
		default:
      		return state.slice()
	}
}