import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import * as actions from "../actions";

import Header from "./Header";
import Landing from "./Landing";

const DashBoard = () => <h1>DashBoard</h1>;
const Survey = () => <h1>Survey</h1>;

class App extends Component {
  componentDidMount() {
    this.props.fetchUser();
  }

  render() {
    return (
      <div className='container'>
        <BrowserRouter>
          <div>
            <Header />

            <Route exact path='/' component={Landing} />
            <Route exact path='/surveys' component={DashBoard} />
            <Route path='/surveys/new' component={Survey} />
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default connect(null, actions)(App);