import React from "react";
import { QuestionContext } from "../QuestionContext";

function TahminQuestion() {
    const { question } = React.useContext(QuestionContext);

  return (
    <div>
      <h1>Tahmin Question</h1>
        <p>{question.text}</p>
    </div>
  );
}

export default TahminQuestion;
