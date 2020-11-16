import React, { Component } from 'react';
import './App.css';
//import {VotingTable} from "./VotingTable";
//import { VotingTable } from './VotingTable.js';

const IpfsHttpClient = require('ipfs-http-client')
const ipfs           =  IpfsHttpClient({host: 'ipfs.infura.io',port:5001, protocol:'https'})
const initial_table  = 'https://ipfs.infura.io/ipfs/QmTTTLx6TdCMSUbdmKuXHwSWKS8xaPityA12Yf22S2BRuC';
var parse            = require('html-react-parser');



class App extends Component {

  constructor(props) {
    super(props);
    this.state =
        {
            buffer: null,
            table_: ''
        }
  }


  captureFile = (event) =>
  {
    event.preventDefault();

    //Get ready for IPFS
    const file   = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () =>
    {
      //state OBJ
      this.setState({buffer:Buffer(reader.result)})
      console.log(this.state)

    }
  }

  onSubmit = (event) => {
    event.preventDefault();
    console.log("Submitting form to  IPFS");
    ipfs.add(this.state.buffer, (error, result) =>
    {
        console.log('IPFS RESULT', result);

        let hash = result[0].hash;

        if(error)
        {
          console.log(error);
          return;
        }
    })


  }
    loadData = () => {
      fetch(initial_table)
        .then(function (response) {
          //console.log(initial_table + " -> " + response.ok);
          if(response.ok){
            return response.text();
          }
          throw new Error('Error message.');
        })
        .then(function (data) {
          //console.log("data: ", data);
            document.getElementById('init').innerHTML = "";
            document.getElementById('init').innerHTML = data;

        }.bind(this))
        .catch(function (err) {
          console.log("failed to load ", initial_table, err.message);
        });
    }

  render() {


    return (

      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <p
            className="navbar-brand col-sm-3 col-md-2 mr-0"

          >
            D-Vote
          </p>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">


              <div id='table-div'>

                  {this.loadData()}
                  <div id='init'></div>
                  <p id='line'></p>
                  <p></p>

                  <form onSubmit={this.onSubmit}>
                    <input type='file' onChange={this.captureFile}/>
                    <input class='btn btn-primary' type='submit' value='Submit Voting List' />

                  </form>
                   <p></p>
              </div>


            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
