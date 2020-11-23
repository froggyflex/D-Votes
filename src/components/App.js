import React, { Component } from 'react';
import './App.css';
import Web3 from "web3";
import * as $ from 'jquery';
import Election from '../abis/Election.json';

const IpfsHttpClient = require('ipfs-http-client')
const ipfs           =  IpfsHttpClient({host: 'ipfs.infura.io',port:5001, protocol:'https'})
const initial_table  = 'https://ipfs.infura.io/ipfs/QmaDZhv2TP6hbkkBsmrgnDNLDLvbfPPYWfWFqtm7HKEsik';
var electionInstance;
var web3;
var netData;
var netAddress;


class App extends Component {

  constructor(props) {
    super(props);
    this.state =
        {
            buffer: null,
            contract: null,
            account:''
        }
  }

  async componentWillMount()
  {
      await this.loadWeb3();
      await this.loadBdata();
      await this.init();

  }

  async loadBdata()
  {
      web3 = window.web3;
      const account = await web3.eth.getAccounts();
      console.log(account)

      this.setState({account:account[0]})
      const netId   = await web3.eth.net.getId();
      console.log('NET ID: ', netId)

      netData = Election.networks[netId];

      if(netData){
        netAddress = netData.address;
      }
      else {
          window.alert("Smart Contract not detected")
      }

  }

  async init()
  {
      fetch(initial_table)
                    .then(function (response) {
                      //console.log(initial_table + " -> " + response.ok);
                      if(response.ok){
                        return response.text();
                      }
                      throw new Error('Error message.');
                    })
                    .then( function (data) {
                      //console.log("data: ", data);

                        document.getElementById('init').innerHTML = "";
                        document.getElementById('init').innerHTML = data;
                        console.log(this.state.account)

                        // Load contract data
                        const contract = window.web3.eth.Contract(Election.abi, netAddress)
                        console.log(contract)
                        this.setState({contract:contract.address})


                        //contract.methods.Candidates().send({from:this.state.account});

                        contract.methods.candidatesCount().call().then(function(candidatesCount) {

                            console.log("Candidates Count ",candidatesCount)
                            electionInstance = contract;
                            var candidatesVote = $("#candidatesSelect");
                            candidatesVote.empty();

                            var candidatesSelect = $('#candidates_table');
                            candidatesSelect.empty();

                            for (var i = 1; i <= candidatesCount; i++) {

                                    contract.methods.candidates(i).call().then(function(candidate) {
                                        //console.log("CANDIDATE: ",candidate)
                                      var id = candidate[0];
                                      var name = candidate[1];
                                      var last = candidate[2];
                                      var desc = candidate[3];
                                      var voteCount = candidate[4];

                                      // Render candidate Result
                                      var candidateTemplate = "<tr><td>" + id + "</td><td>" + name + "</td><td>" + last + "</td><td>" + desc + "</td><td>" + voteCount + "</td></tr>"
                                        candidatesSelect.append(candidateTemplate);

                                      // Render candidate ballot option
                                      var candidateOption = "<option value='" + id + "' >" + name + " "+last+ "</ option>"
                                      candidatesVote.append(candidateOption);
                                    });
                            }

                        });

                        //check if the voter has voted
                        contract.methods.voters(this.state.account).call().then(function(hasVoted) {
                          // Do not allow a user to vote
                            console.log("HAS VOTED? ",hasVoted)

                          if(hasVoted) {
                            $('form').hide();
                            console.log('Account', this.state.account,' already voted')
                          }
                        }).catch(function(error) {
                          console.warn(error);
                        });

                    }.bind(this))
                    .catch(function (err) {
                      console.log("failed to load ", initial_table, err.message);
                    });
  }

  async loadWeb3()
  {

      if(window.ethereum)
      {
          window.web3 = new Web3(window.ethereum)
          await window.ethereum.enable();
      }
      if(window.web3)
      {
          window.web3 = new Web3(window.web3.currentProvider)
      }
      else{
          window.alert("Please use metamask in order to use this Dapp!")

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


    }
  }
  async castVote() {

      var candidateId = $('#candidatesSelect').val();
      const contract = web3.eth.Contract(Election.abi, Election.networks[await web3.eth.net.getId()].address)
      this.setState({contract:contract});
      await contract.methods.vote(candidateId).call();

      /*
      {
          return instance.vote(candidateId, {from: App.account});
      }).then(function (result) {
          // Wait for votes to update
          $("#content").hide();
          $("#loader").show();
      }).catch(function (err) {
          console.error(err);
      });

       */
  }
  onSubmit = (event) => {
    event.preventDefault();
    console.log("Initiate voting proccess...");



    /*ipfs.add(this.state.buffer, (error, result) =>
    {
        console.log('IPFS RESULT', result);

        let hash = result[0].hash;

        //send the hash to Ethereum
        this.state.loadContract.methods.setHash(hash).send({from:this.state.account}).then((r) => {
            this.setState({hash});
        })


        if(error)
        {
          console.log(error);
          return;
        }
    })
    */

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

            <ul>
               <li>Account: {this.state.account} </li>
                <li>Active Contract: {this.state.contract}</li>

            </ul>

        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">


              <div id='table-div'>

                  {}

                  <div id='init'></div>
                  <p id='line'></p>
                  <p></p>

                  <form  onSubmit={this.onSubmit}>
                    {/*<input type='file' onChange={this.captureFile}/>*/}
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
