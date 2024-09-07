import React, { useEffect, useState } from "react";
import "../App.css"; // Stil dosyasını ekledik

const QuestionModal = ({ isVisible, question, onClose, onSubmit }) => {
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("question:", question);
    setError("");
    }, [isVisible]);

  if (!isVisible) return null;

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    const answer = e.target.elements.answer.value.trim();

    if (!answer) {
      setError("Lütfen bir cevap girin.");
      return;
    }

    onSubmit(answer);
    onClose(); // Modal'ı kapat
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{question.text}</h2>

        {(question.qType === "genelKültür" ||question.qType === "hangiDil" || question.qType === "ünlüSöz") && (
          <form onSubmit={handleAnswerSubmit}>
            <label>
              <input type="radio" name="answer" value={question.choiceA} /> A) {question.choiceA}
            </label>
            <label>
              <input type="radio" name="answer" value={question.choiceB} /> B) {question.choiceB}
            </label>
            <label>
              <input type="radio" name="answer" value={question.choiceC} /> C) {question.choiceC}
            </label>
            <label>
              <input type="radio" name="answer" value={question.choiceD} /> D) {question.choiceD}
            </label>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="submit-button">Cevabı Gönder</button>
          </form>
        )}
        {["tahmin", "emojiMovie", "joke", "anagram", "dahaOlası", "hangiŞehir"].includes(question.qType) && (
          <form onSubmit={handleAnswerSubmit}>
            <label>
              Cevabınızı girin:
              <input type="text" name="answer" required className="text-input" />
            </label>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="submit-button">Cevabı Gönder</button>
          </form>
        )}

        <button onClick={onClose} className="close-button">Kapat</button>
      </div>
    </div>
  );
};

export default QuestionModal;
