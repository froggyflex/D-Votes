pragma solidity ^0.5.16;

contract Election {

    //are Candidates in the list?
    string  populated = "0" ;
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        string lastname;
        string jobTitle;
        uint voteCount;


    }
    function setPop(string memory _populated) public{
        populated = _populated;
    }

    function getPop() public view returns (string memory)
    {
        return populated;
    }
    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Candidates

    // Fetch Candidate
    mapping(uint => Candidate) public candidates;


    // Store Candidates Count
    uint public candidatesCount;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );

    function Candidates () public {
        addCandidate("Barack", "Obama", "A good President");
        addCandidate("Joe", "Biden", "A we will see President");
        addCandidate("Donald", "Trump", "A great piece of cake :) ");

    }

    function addCandidate (string memory _name, string memory _lastname, string memory _jobTitle) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name,_lastname,_jobTitle, 0);

    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }
}


