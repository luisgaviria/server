import React, { useState } from "react";
import Payments from "./Payments";

const Landing = () => {
  const [state, setState] = useState({
    showPayments: false,
  });
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Emaily!</h1>
      Collect feedback from your users
      <button
        onClick={() => {
          setState({ showPayments: !state.showPayments });
        }}
        style={{ display: "block", margin: "auto", marginTop: "20px" }}
      >
        Payment Form
      </button>
      {state.showPayments ? <Payments /> : null}
    </div>
  );
};

export default Landing;
