import "materialize-css/dist/css/materialize.min.css";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import reduxThunk from "redux-thunk";

import App from "./components/App";
import reducers from "./reducers";

// Development only axios helpers!
import axios from "axios";
window.axios = axios;

const store = createStore(reducers, {}, applyMiddleware(reduxThunk));

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

ReactDOM.render(
  <Elements stripe={stripePromise}>
    <Provider store={store}>
      <App />
    </Provider>
  </Elements>,
  document.querySelector("#root")
);
