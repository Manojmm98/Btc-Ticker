import React, { Component } from 'react';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';

import Container from 'react-bootstrap/lib/Container';
import Sockette from 'sockette';

import BidsBook from '../components/OrderBook/BidsBook'
import AsksBook from '../components/OrderBook/AsksBook'
import TradesList from '../components/Trades/TradesList'

import {connect} from 'react-redux'
import updateBidsOrderBook from '../store/OrderBook/actions/update_bids'
import clearBidsOrderBook from '../store/OrderBook/actions/clear_bids'
import updateAsksOrderBook from '../store/OrderBook/actions/update_asks'
import clearAsksOrderBook from '../store/OrderBook/actions/clear_asks'
import updateTrades from '../store/Trades/actions/update_trades'
import {bindActionCreators} from 'redux'

import '../css/OrderBook.css';

let ws;
class OrderBook extends Component {

// define state for volume,pricechange ,bid ,low and for high price  also for  precission and for connectioreddy and isconnected

  constructor(props) {
      super(props);
    
      this.state = {
         connectionReady: true,
         isConnected: false,
         pres: 'P0',
         bid :0,
         volume24h: 0,
         lastPrice: 0,
         priceChange: 0,
         low : 0,
         high : 0,
      }
   }


   // define a function subcribedtoall(there will be two function connectionestablished and connectionclose)  where we will set connectionreddy as true and find book request ,trade request and ticker request
  subscribeToAll(){
    // declaring this as self
    const self = this;
    // define payload as a object which will be the data recived from websocket bibns api
    let payloadData = {};
    function onConnectionEstablished(e){
      console.log('connected');
      console.log(e);
      self.setState({connectionReady: true});


      // for book request
      let bookRequest = JSON.stringify({ 
        event: 'subscribe', 
        channel: 'book', 
        symbol: 'tBTCUSD',
        prec: self.state.pres
      })

      // for trade request
      let tradesRequest = JSON.stringify({ 
        "event": "subscribe",
        "channel": "trades",
        "symbol": "tBTCUSD"
      })

     // for ticker

      let tickerRequest = JSON.stringify({ 
        "event": "subscribe",
        "channel": "ticker",
        "symbol": "tBTCUSD"
      })

      // send request for finding the ticker data
      ws.send(tickerRequest);
      
      // for traders and order list
      // ws.send(tradesRequest); 
      // ws.send(bookRequest); 
    }
// on closing of connection just log closed to console
    function onConnectionClosed(e){
      console.log('closed');
      console.log(e);
    }
// on message recived find the payload data which will be two dimensional array
    function onMessageRecieved(e){
      payloadData = JSON.parse(e.data);
        // console.log("data"+JSON.stringify(payloadData));

        //for order book data the length should be 3 and will present in 1st index
        if (!payloadData.event && Array.isArray(payloadData[1]) && payloadData[1].length === 3) {
          let tmpbookOrderRow = {
            price: parseFloat(payloadData[1][0]).toFixed(1),
            count: payloadData[1][1],
            amount: parseFloat(payloadData[1][2]).toFixed(2),
            total: parseFloat(0).toFixed(2)
          }
          if (tmpbookOrderRow.amount > 0) {
            self.props.updateBidsOrderBook(tmpbookOrderRow);
          }
          else{
            self.props.updateAsksOrderBook(tmpbookOrderRow);
          }
        }

        //for  trades data the length will be 3 and it will present on 2nd index
        if (!payloadData.event && Array.isArray(payloadData[2]) && payloadData.length === 3) {
          let tmpTradeArray = [];
          let tmpTrade = {
              price: parseFloat(payloadData[2][3]).toFixed(1),
              amount: payloadData[2][2],
              timestamp: payloadData[2][1],
              period: payloadData[2][0]
            }
            
            tmpTradeArray.push(tmpTrade);
            self.props.updateTrades(tmpTradeArray);
        }

        //for  ticker data for reciving ticker data the length should be 10

        if (!payloadData.event && Array.isArray(payloadData[1]) && payloadData[1].length === 10) {
          self.setState({
             //Volume in BTC will be at 7th position.
             volume24h: payloadData[1][7],
             // bid of btc will be 0th index
             bid: payloadData[1][0],
             // high value will be in 8th index
             high : payloadData[1][8],
             // low value will be in 9th index
             low : payloadData[1][9],
             // last price will be at  6th index 
             lastPrice: payloadData[1][6],
             // price change will be at 5th index multiply with 100 
             priceChange: payloadData[1][5] * 100
          });
        }
    }
    // web socket Sockette
    ws = new Sockette('wss://api-pub.bitfinex.com/ws/2', {
      // define timeout , onclose,onopen,onmessage,onerror,onmaxium
      timeout: 5e3,
      maxAttempts: 10,
      onopen: onConnectionEstablished,
      onmessage: onMessageRecieved,
      onreconnect: e => console.log('Reconnecting...', e),
      onmaximum: e => console.log('Stop Attempting!', e),
      onclose: e => onConnectionClosed,
      onerror: e => console.log('Error:', e)
    });
    // set the state for connected as true 
    this.setState({isConnected: true});
  }

// close the websocket connection and mak setstate as false

  closeConnection(){
    ws.close();
    this.setState({isConnected: false});
  }

  // for show morePrecision
  morePrecision(){
    this.closeConnection();
    this.props.clearBidsOrderBook();
    this.props.clearAsksOrderBook();
    const currentPres = this.state.pres;
    switch(currentPres){
      case 'P0':
        this.setState({pres: 'P1'});
        break;

      case 'P1':
        this.setState({pres: 'P2'});
        break;

      case 'P2':
        this.setState({pres: 'P3'});
        break;

      default:

        return;
    }

    this.subscribeToAll();
  }

  // for less precision
  lessPrecision(){
    this.closeConnection();
    this.props.clearBidsOrderBook();
    this.props.clearAsksOrderBook();
    const currentPres = this.state.pres;
    switch(currentPres){
      case 'P3':
        this.setState({pres: 'P2'});
        break;

      case 'P2':
        this.setState({pres: 'P1'});
        break;

      case 'P1':
        this.setState({pres: 'P0'});
        break;

      default:

        return;
    }

    this.subscribeToAll();
  }


  // for formatting the number with commas separated here we took this regular expression
  formmatNumberWithCommas(currentNumber){
    return currentNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  render() {
    let priceChangeColor = this.state.priceChange >= 0 ? 'rgba(82,108,46)' : 'rgba(139,42,2)';
    priceChangeColor = this.state.priceChange === 0 ? 'white' : priceChangeColor;

    let priceChangeSign = this.state.priceChange >= 0 ? ' +' : ' -';
    priceChangeSign = this.state.priceChange === 0 ? '' : priceChangeSign;
   // console.log(this.state.lastPrice);

    return (
      <Container fluid={true}>
      <Row>
        <Col lg={12} className="buttons-container text-left">
          <div className="ticker-container text-left">
          <i class="fa-brands fa-btc"></i>
                  <h3>BTC/USD : {this.state.bid}</h3>
                  <p>Last Price_USD: {this.state.lastPrice}  </p>
                  <p> VOL_BTC: {this.formmatNumberWithCommas(this.state.volume24h.toFixed(0))}</p>
                  <p> high : {this.state.high}</p>
                  <p> low : {this.state.low}</p>
                  <p style={{color: priceChangeColor}}>Price Change:{priceChangeSign} {this.state.priceChange.toFixed(2)}%</p>
                </div>
          <ButtonToolbar>
                <Button disabled={!this.state.connectionReady || this.state.isConnected} onClick={this.subscribeToAll.bind(this)}>Connect</Button>
                <Button  disabled={!this.state.isConnected} onClick={this.closeConnection.bind(this)}>Disconnect</Button>
          </ButtonToolbar>
        </Col>
      </Row>
    
         {/* if we want to show trader list and oder list then uncomment this */}

      {/* this is for traders list and order book if we want that feature then we can uncomment it */}

            {/* <Row>
              <Col lg={9}>
                <Container fluid={true}>
                      <Row>
                        <Col lg={12}>
                          <h3 className="text-left">ORDER BOOK BTC/USD</h3>
                          <ButtonToolbar style={{marginBottom: '20px'}}>  
                                 <p className="text-left">Precision:</p>
                                 <Button disabled={(this.props.orderBookAsks.length < 1 && this.props.orderBookBids.length < 1) || this.state.pres === 'P3'} onClick={this.morePrecision.bind(this)}>+</Button>
                                 <Button  disabled={(this.props.orderBookAsks.length < 1 && this.props.orderBookBids.length < 1) || this.state.pres === 'P0'} onClick={this.lessPrecision.bind(this)}>-</Button>
                          </ButtonToolbar>
                        </Col>
                        <Col lg={6} className='bids-container'>
                         <BidsBook orderBookBids={this.props.orderBookBids}/>
                        </Col>
                        <Col lg={6} className='asks-container'>
                         <div className="depth-bars-asks-container"></div>
                         <AsksBook orderBookAsks={this.props.orderBookAsks}/>
                        </Col>
                      </Row>
                </Container>
              </Col>
              <Col lg={3}>
                <Row>
                    <Col lg={12}>
                        <h3 className="text-left">TRADES BTC/USD</h3>
                    </Col>
                    <Col lg={12}>
                      <TradesList tradesList={this.props.tradesList}/>
                    </Col>
                </Row>
              </Col>
            </Row> */}
      </Container>
    );
  }
}

// define state for order_book_bids and order_book_asks and tradesList
 
function mapStateToProps(state) {
  return {
    orderBookBids: state.orderBookBids,
    orderBookAsks: state.orderBookAsks,
    tradesList: state.tradesList
  };
}

// dispatch the action for  bids order,trdaers,clearing bids,asking order book
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      updateAsksOrderBook: updateAsksOrderBook, 
      updateBidsOrderBook: updateBidsOrderBook, 
      updateTrades: updateTrades,
      clearBidsOrderBook: clearBidsOrderBook,
      clearAsksOrderBook: clearAsksOrderBook
    }, dispatch);
  }

export default connect(mapStateToProps, mapDispatchToProps)(OrderBook) 