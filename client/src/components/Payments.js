import React from "react";
//import StripeCheckout from "react-stripe-checkout";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
// import axios from "axios";
import { connect } from "react-redux";
import * as actions from "../actions";

const Payments = (props) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { token } = await stripe.createToken(
      elements.getElement(CardElement)
    );
    if (token) {
      props.handleToken(token);
    }
  };

  // const billingDetails = {
  //   name: ev.target.name.value,
  //   email: ev.target.email.value,
  //   address: {
  //     city: ev.target.city.value,
  //     line1: ev.target.address.value,
  //     state: ev.target.state.value,
  //     postal_code: ev.target.zip.value,
  //   },
  // };

  return (
    <form
      style={{
        marginTop: "20px",
        border: "1px solid black",
        borderRadius: "4px",
      }}
      onSubmit={handleSubmit}
    >
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
      <button type='submit' disabled={!stripe}>
        Complete Transaction
      </button>
    </form>
  );
};

export default connect(null, actions)(Payments);
