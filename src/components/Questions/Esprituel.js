import React from "react";
import { QuestionContext } from "../QuestionContext";

function EsprituelQuestion() {
    const { question } = React.useContext(QuestionContext);

  return (
    <div>
      <h1>Esprituel</h1>
        <p>{question.text}</p>
    </div>
  );
}

export default EsprituelQuestion;
