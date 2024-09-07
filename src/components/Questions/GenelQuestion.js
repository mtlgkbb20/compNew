import React from "react";
import { QuestionContext } from "../QuestionContext";

function GenelQuestion() {
    const { question } = React.useContext(QuestionContext);

  return (
    <div>
      <h1>Genel Question</h1>
        <p>{question.text}</p>
    </div>
  );
}

export default GenelQuestion;
