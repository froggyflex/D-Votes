import React, { Component, createRef} from 'react';
import './App.css';
import Web3 from "web3";
import * as $ from 'jquery';
import Election from '../abis/Election.json';
import IPFSHash from '../abis/IPFSHash.json';
import IPFS from "ipfs-mini";
import CryptoJS from "react-native-crypto-js";
import html2canvas from "html2canvas";
const IpfsHttpClient = require('ipfs-http-client')
const ipfs           =  IpfsHttpClient({host: 'ipfs.infura.io',port:5001, protocol:'https'})
const initial_table  = 'https://ipfs.infura.io/ipfs/QmaDZhv2TP6hbkkBsmrgnDNLDLvbfPPYWfWFqtm7HKEsik';
const URL            = "https://ipfs.infura.io/ipfs/";
var electionInstance;
var web3;
var netData;
var netAddress;

var netDataHash;
var netAddressHas;
var connected_account;
var ref;
var lastHash="";
var cc;


class Pair {
  constructor(id, votecount) {
    this.id = id;
    this.votecount = votecount;
  }
}

class VotingSession {
  constructor(hashedvoter, pairdata) {
    this.hashedvoter = hashedvoter;
    this.pairdata    = pairdata;
  }
}


class App extends Component {
  constructor(props) {
    super(props);
    this.getLastState = this.getLastState.bind(this);
    this.state =
        {
            buffer: null,
            contract: null,
            account:'',
            voters: []
        }


  }
  makeid = (length) => {
       var result           = '';
       var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
       var charactersLength = characters.length;
       for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

  async componentWillMount()
  {
      await this.loadWeb3();
      await this.loadBdata();
      this.getLastState();


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
          window.web3 = new Web3(window.web3.currentProvider, undefined, {transactionConfirmationBlocks: 1})
      }
      else{
          window.alert("Please use metamask in order to use this Dapp!")

      }
  }
  async loadBdata()
  {
      web3 = window.web3;
      const account = await web3.eth.getAccounts();
      console.log(account)

      this.setState({account:account[0]})

      connected_account = account[0];
      const netId   = await web3.eth.net.getId();
      console.log('NET ID: ', netId)

      netData = Election.networks[netId];
      netDataHash = IPFSHash.networks[netId];

      if(netData){
        netAddress = netData.address;
        netAddressHas = netDataHash.address;
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

                        const contract = window.web3.eth.Contract(Election.abi, netAddress);
                        //console.log(contract)
                        this.setState({contract:contract.address})

                        //0x542AfDAbd71AaF36DD00157096849A24B3FE4F0B

                        contract.methods.getPop().call().then(function (populated)
                        {
                            console.log(populated,'populated')
                            if(populated == "0")
                            {
                                contract.methods.Candidates().send({from:this.state.account}).then(function (r)
                                {
                                    console.log(r,'Candidates')
                                    contract.methods.setPop("1").send({from:this.state.account}).then(function (r)
                                    {
                                        this.init();
                                    }.bind(this));

                                }.bind(this))
                            }
                        }.bind(this));

                        contract.methods.candidatesCount().call().then(function(candidatesCount) {

                            console.log("Candidates Count ",candidatesCount)

                            electionInstance = contract;
                            var candidatesVote = $("#candidatesSelect");
                            candidatesVote.empty();

                            var candidatesSelect = $('#candidates_table');
                            candidatesSelect.empty();

                                let rv = [];

                            for (var i = 1; i <= candidatesCount; i++) {

                                    contract.methods.candidates(i).call().then((candidate) => {
                                        //console.log("CANDIDATE: ",candidate)
                                      var id = candidate[0];
                                      var name = candidate[1];
                                      var last = candidate[2];
                                      var desc = candidate[3];
                                      var voteCount = candidate[4];

                                      // Render candidate Result
                                      var candidateTemplate = "<tr><td>" + id + "</td><td>" + name + "</td><td>" + last + "</td><td>" + desc + "</td><td id='vc"+id+"'>" + voteCount + "</td></tr>"
                                        candidatesSelect.append(candidateTemplate);

                                      // Render candidate ballot option
                                      var candidateOption = "<option value='" + id + "' >" + name + " "+last+ "</ option>"
                                      candidatesVote.append(candidateOption);
                                      // Object.assign(rv, {item : });
                                       rv.push(new Pair(id,voteCount));
                                       // rv[id] =

                                    });


                            }

                        }.bind(this));
                        //console.log(record_voteds);
                        //console.log(final_state);
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
                     console.log('testing',$("vc1").val());
  }
  getLastState = () =>
  {
                   // Load contract data
                    const contract = window.web3.eth.Contract(Election.abi, netAddress);
                    const HashContract = window.web3.eth.Contract(IPFSHash.abi, netAddressHas);
                    this.setState({contract:"LastHashC "+contract.address})
                    //console.log("LAST HASH", contract.methods.setIpfsHash().call());



                    HashContract.methods.getHash().call().then(async (lastHash) =>
                    {
                         console.log("LAST HASH", lastHash);

                        if(lastHash === 'NaN') {
                           this.init();
                        }
                        else {


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


                                        fetch(URL+lastHash+"")
                                        .then(function (response) {
                                          //console.log(initial_table + " -> " + response.ok);
                                          if(response.ok){
                                            return response.text();
                                          }
                                          throw new Error('Error message.');
                                        })
                                        .then( function (data) {
                                            console.log("last state result\n");
                                            console.log(data);
                                            lastHash = JSON.parse(data);



                                            /*
                                                [{"hashedvoter":"0x41e8542453eB59845897EC321f84E0a07464da34","pairdata":[{"id":{"_hex":"0x01"},"votecount":{"_hex":"0x03"}},{"id":{"_hex":"0x02"},"votecount":{"_hex":"0x02"}},{"id":{"_hex":"0x03"},"votecount":{"_hex":"0x01"}}]},{"hashedvoter":"0x41e8542453eB59845897EC321f84E0a07464da34",
                                                "pairdata":[
                                                    {"id":{"_hex":"0x01"},"votecount":{"_hex":"0x03"}},
                                                    {"id":{"_hex":"0x02"},"votecount":{"_hex":"0x02"}},
                                                    {"id":{"_hex":"0x03"},"votecount":{"_hex":"0x01"}}
                                                ]}]
                                            */


                                            this.setState({contract:"EleC "+contract.address})

                                            contract.methods.candidatesCount().call().then(function(candidatesCount) {

                                                console.log("Candidates Count ",candidatesCount)
                                                electionInstance = contract;
                                                var candidatesVote = $("#candidatesSelect");
                                                candidatesVote.empty();

                                                var candidatesSelect = $('#candidates_table');
                                                candidatesSelect.empty();


                                                for (var i = 1; i <= candidatesCount; i++) {

                                                        let vc = parseInt(lastHash[0].pairdata[i-1].votecount._hex);
                                                        contract.methods.candidates(i).call().then(function(candidate) {
                                                            //console.log("CANDIDATE: ",candidate)

                                                          var id = candidate[0];
                                                          var name = candidate[1];
                                                          var last = candidate[2];
                                                          var desc = candidate[3];
                                                          var voteCount = vc;

                                                          // Render candidate Result
                                                          var candidateTemplate = "<tr><td>" + id + "</td><td>" + name + "</td><td>" + last + "</td><td>" + desc + "</td><td>" + voteCount + "</td></tr>"
                                                            candidatesSelect.append(candidateTemplate);

                                                          // Render candidate ballot option
                                                          var candidateOption = "<option value='" + id + "' >" + name + " "+last+ "</ option>"
                                                          candidatesVote.append(candidateOption);

                                                        });

                                                }


                                            });

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


                            }.bind(this))
                            .catch(function (err) {
                              console.log("failed to load ", initial_table, err.message);
                            });

                        }

                    });

  }
  castVote()
  {

          var candidateId = $('#candidatesSelect').val();
          const contract = web3.eth.Contract(Election.abi, netAddress)
          const HashContract = web3.eth.Contract(IPFSHash.abi, netAddressHas)
          var final_state = [];
          var record_voteds = [];
          var cc;
          var ipfsu = new IPFS({host: 'ipfs.infura.io',port:5001, protocol:'https'})
          contract.methods.vote(candidateId).send({from:this.state.account})
              .then((r)=>{
              console.log('SUCCESS');
                  contract.methods.candidatesCount().call()
                  .then(function (candidatesCount){


                            cc = parseInt(candidatesCount._hex);
                            var candidatesVote = $("#candidatesSelect");
                            candidatesVote.empty();

                            var candidatesSelect = $('#candidates_table');
                            candidatesSelect.empty();

                            for (var i = 1; i <= candidatesCount; i++) {

                                    contract.methods.candidates(i).call().then(function(candidate) {

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
                                      record_voteds.push(new Pair(id,voteCount));

                                      if(id == cc)
                                      {

                                           /*

                                                the idea here to encrypt the voter and send the array final_state to IPFS. The contract used (Election)
                                                will keep always the last hashed state of the application D-Vote. By doing so, we can have always for everyone the same
                                                number of votes even if they bypass the contract as the data that will populate the table will be retrieved from IPFS. As the vote should be
                                                anonymous, by encrypting it with AES it is not possible to see who voted who. The only thing that can be considered public
                                                is the number of votes per candidate and even this, can be seen only after the vote session has been submitted.
                                            */
                                          console.log('just finished the loop')
                                          final_state.push(new VotingSession(connected_account, record_voteds));
                                          ipfsu.addJSON(final_state,(error, result) =>
                                              {
                                                 console.log("IPFS RESULT")
                                                 console.log(result);

                                                 if(result != undefined)
                                                 {
                                                       //send the hash to Ethereum
                                                        console.log("About to call the contract to save the Hash")
                                                       HashContract.methods.setHash(result).send({from:connected_account}).then((r) =>{

                                                       });
                                                 }
                                                 if(error){

                                                  console.log(error);
                                                  return;
                                                }

                                             })
                                      }

                                    });


                            }





                        }.bind(this))
                  .then( function (r) {
                        contract.methods.voters(connected_account).call().then(function(hasVoted) {
                                console.log("HAS VOTED? ", hasVoted)
                                if (hasVoted) {
                                    $('form').hide();
                                        console.log('Account', connected_account, ' just voted')
                                }
                            });
              });
          })
          .catch((error) => {
              console.log(error.message)
          });






  }
  onSubmit = (event) => {
    event.preventDefault();
    console.log("Initiate voting proccess...");
    this.castVote();
  }



  render() {

        const test = () => {
             document.getElementById('staticPlace').innerHTML = new Date().getDate() +"-"+new Date().getMonth() +"-"+new Date().getFullYear()+"  "+new Date().getHours()+":"+new Date().getMinutes()+":"+new Date().getSeconds();

             html2canvas(document.querySelector("#root"))
            .then(function (canvas) {
                var base64URL = canvas.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream');

                 fetch('data:image/jpeg;'+base64URL)
                .then(res => res.blob())
                .then(blob => {
                  const file = new File([blob], 'lastStateSession.jpeg', blob)

                    ipfs.add(file, (error, result) => {
                        if(error) {
                         console.error(error)
                         return
                        }
                        document.getElementById('public_state').innerText = "View Public Results";
                        document.getElementById('public_state').href = 'https://ipfs.infura.io/ipfs/'+result[0].hash;
                        document.getElementById('public_state').target = '_blank';



                })

            })





         });
        }
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

                  <p id='staticPlace'></p>
                  <div id='init'></div>
                  <p id='line'></p>
                  <p></p>

                  <form  onSubmit={this.onSubmit}>
                    {/*<input type='file' onChange={this.captureFile}/>*/}
                    <input class='btn btn-primary' type='submit' value='Submit Voting List' />

                    <br></br> <br></br>

                  </form>
                  <p></p>
                  <button class='btn btn-success' onClick={test}>Publish Results</button>
                  <br></br><br></br>
                  <a id='public_state'></a>
                  <br></br>



              </div>


            </main>
          </div>
        </div>
      </div>
    );

  }
}

export default App;
