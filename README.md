# D-Votes

<legend>To do:</legend>
<ul>
  <li>Encrypt the voter address
  <li>Impelemt a way to check if the candidates have already been added automatically
</u>
<br><br><br><br>
<b> LOGIC OF DAPP </b>

Basically this dapp aims to decentralize data as much as possible. For this reason, an initial (manual upload) of an
empty table was uploaded into IPFS. The file named root exists as default:

 <table>
                <thead>
                <tr>
		                <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Job Title</th>
                    <th>Number of Votes</th>
                </tr>
                </thead>
            
</table>

----------------------------------------------------------------------------------------------------------------------------

After the initialisation of the helper functions, the dapp runs the method <b>getLastState()</b> in order to check if some 
votes have already been recorded. If not, it launches the <b>init()</b> method which will get the IPFS table (still empty as 
no votes have been added yet). Once the table has been parsed and displayed, the dapp requests with a contract to populate the 
data structure within the contract that will be the result of the callback with the call <i>contract.methods.Candidates().send({from:account})</i>. 
This contract as mentioned before, will load the structure of type Candidate. In order to access the latters we need to make a call at the 
<i>contract.methods.candidatesCount().call()</i> in order to iterate through the mappings and populate the table return earlier from IPFS.

<h2>How the voting works</h2>
In order for the user to vote, we must initiate a new function of the same contract like:
<i>contract.methods.vote(candidateId).send({from:account})</i>.
This will record the vote inside the contract structure dedicated to the vote count but as mentioned earlier the goal is to try to decentralize
as much as possible, so a JSON file containing the voters address and the vote counts is generated and sent to IPFS. The returned hash will be saved in the blockchain
with the help of another contract named LastIPFSHash.sol which has just two functions (getHash, setHash). This proccess will be executed every time a voter votes. By saving 
the hash, every time we call the Dapp the table will be populated with the latest records since now the LastIPFSHash will return a valid hash. Below it is possible to 
understand the proccess:
                    
                    //we check if there is a valid hash that will contain the latest records
                    HashContract.methods.getHash().call().then(async (lastHash) =>
                    {
                         console.log("LAST HASH", lastHash);

                        if(lastHash === 'NaN') {
                           this.init(); //init will retrieve the empty table and request the Candidates from the mapping inside the contract Election
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
                                                how the data looks returned from IPFS
                                                [
                                                  {
                                                   "hashedvoter":"0x41e8542453eB59845897EC321f84E0a07464da34",
                                                   "pairdata":[ 
                                                                {"id":{"_hex":"0x01"},"votecount":{"_hex":"0x03"}},
                                                                {"id":{"_hex":"0x02"},"votecount":{"_hex":"0x02"}},
                                                                {"id":{"_hex":"0x03"},"votecount":{"_hex":"0x01"}}
                                                               ]
                                                   }
                                                 ]
                                               
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


----------------------------------------------------------------------------------------------------------------------------

By following this logic we take advantage of the fact that the files uploaded to IPFS are immutable and so the results in the votes will always be 
truthfull. Even if someone tries to enter the contract code to alter the votecounts of Candiddates, it won't have an effect as the votecount is stored in IPFS.
