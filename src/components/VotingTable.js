import React from "react";
import './App.css';

class VotingTable extends React.Component {
    constructor(props) {
      super(props)
     }

    render() {
        return (
            <table>
                <thead>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Job Title</th>
                    <th>Vote</th>
                    <th>Number of Votes</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Barack</td>
                    <td>Obama</td>
                    <td>A good President</td>
                    <td><input type='checkbox' /></td>
                     <td></td>
                </tr>
                <tr>
                    <td>Donald</td>
                    <td>Trump</td>
                    <td>A cringy President</td>
                    <td><input type='checkbox' /></td>
                     <td></td>
                </tr>
                 <tr>
                    <td>Joe</td>
                    <td>Biden</td>
                    <td>A who President</td>
                    <td><input type='checkbox' /></td>
                     <td></td>
                </tr>

                </tbody>
            </table>
        )
    }
}

export { VotingTable}