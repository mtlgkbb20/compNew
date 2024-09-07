import React, { useEffect, useState } from "react";
import { useSelectedUsers } from "./SelectedUsers"; // custom hook
import { useNavigate } from "react-router-dom";
import { db } from "./database";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";

const QuestionTable = () => {
  const { selectedUsersLast, setSelectedUsersLast } = useSelectedUsers(); // get selected users
  const questionTypes = ["genelKültür", "tahmin", "emojiMovie", "hangiDil", "ünlüSöz", "hangiŞehir", "anagram", "dahaOlası", "joke", "Bonus Tolga?"];
  const jokers = ["Kişisel Asistana sor", "Riskli Bomba", "Dost Kurşunu", "Yarım Olsun Benim Olsun", "Bencil Ben"]
  const [questions, setQuestions] = useState([]);
  const [questionLengths, setQuestionLengths] = useState({});
  const [userScores, setUserScores] = useState({}); // Store scores for each user
  const [loading, setLoading] = useState(true);
  const [questionMaxLength, setQuestionMaxLength] = useState({});
  const [userQuestions, setUserQuestions] = useState({}); // Store questions for each user
  const [modalVisible, setModalVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      let questionNumberPerType = {};
      let questionList = {};
      const questionsCollection = collection(db, "questions");
      const questionsSnapshot = await getDocs(questionsCollection);
      const questionsList = questionsSnapshot.docs.map((doc) => doc.data());

      questionTypes.forEach((type) => {
        questionNumberPerType[type] = 0;
        questionList[type] = [];
      });

      questionsList.forEach((question) => {
        if (questionTypes.includes(question.qType)) {
          questionNumberPerType[question.qType] += 1;
          questionList[question.qType].push(question);
        }
      });

      const updatedQuestionMaxLength = {};
      questionTypes.forEach((type) => {
        if (type === "genelKültür") updatedQuestionMaxLength[type] = 1;
        else if (type === "hangiDil") updatedQuestionMaxLength[type] = 2;
        else if (type === "emojiMovie") updatedQuestionMaxLength[type] = 1;
        else if (type === "ünlüSöz") updatedQuestionMaxLength[type] = 1;
        else if (type === "hangiŞehir") updatedQuestionMaxLength[type] = 1;
        else if (type === "anagram") updatedQuestionMaxLength[type] = 2;
        else if (type === "dahaOlası") updatedQuestionMaxLength[type] = 2;
        else {
          updatedQuestionMaxLength[type] = Math.floor(
            10 / (selectedUsersLast.length || 1)
          ); // Avoid division by zero
        }
      });

      setQuestionLengths(questionNumberPerType);
      setQuestions(questionList);
      setQuestionMaxLength(updatedQuestionMaxLength);

      // Randomly pick questions for each user
      const updatedUserQuestions = {};
      let remainingQuestions = { ...questionList }; // Başlangıçta tüm sorular

      selectedUsersLast.forEach((user) => {
        const userQuestions = {};
        questionTypes.forEach((type) => {
          userQuestions[type] = randomQuestionPicker(
            remainingQuestions[type],
            updatedQuestionMaxLength[type]
          );

          // Remove selected questions from remainingQuestions list
          userQuestions[type].forEach((question) => {
            const index = remainingQuestions[type].indexOf(question);
            if (index > -1) {
              remainingQuestions[type].splice(index, 1); // Remove the question from the list
            }
          });
        });
        updatedUserQuestions[user.name] = userQuestions;

        // Query the user document by name
        const userQuery = query(
          collection(db, "competitiors"),
          where("name", "==", user.name)
        );

        // Fetch user data
        getDocs(userQuery)
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              const updatedScore = userDoc.data().point;
              setUserScores((prevScores) => ({
                ...prevScores,
                [user.name]: updatedScore,
              }));
            } else {
              console.error(`User with name ${user.name} not found.`);
            }
          })
          .catch((error) => {
            console.error("Error fetching user data: ", error);
          });
      });

      setUserQuestions(updatedUserQuestions);
      setLoading(false); // Set loading to false after data has been fetched
    };
    fetchQuestions();
  }, [selectedUsersLast]);

  const randomQuestionPicker = (questions, numQuestions) => {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numQuestions);
  };

  const handleReset = () => {
    localStorage.removeItem("selectedUsers");
    setSelectedUsersLast([]);
    navigate("/adminPanel");
  };

  const goQuestion = async (user, type, btnIndex) => {
    const questionTemp = userQuestions[user.name][type][btnIndex];

    // Save the selected question's id and correct answer to the user's document in the database
    try {
      console.log("Saving the selected question ID and correct answer...");
      const userDocRef = doc(db, "competitiors", user.id);
      console.log("userDocRef: ", userDocRef);
      const userSnapshot = await getDoc(userDocRef);
      console.log("userSnapshot: ", questionTemp.id);
      console.log("userSnapshot: ", questionTemp.correctAnswer);
      if (userSnapshot.exists()) {
        console.log("User document found.");
        await updateDoc(userDocRef, {
          [`${type}QuestionId`]: questionTemp.id,
          [`${type}CorrectAnswer`]: questionTemp.correctAnswer, // correctAnswer alanını ekle
        });
      }
    } catch (error) {
      console.error(
        "Error saving the selected question ID and correct answer: ",
        error
      );
    }

    localStorage.setItem("currentQuestion", JSON.stringify(questionTemp));
    setCurrentQuestion(questionTemp);
    setModalVisible(true);
  };
  const evaluateAnswers = async (questionId, correctAnswer) => {      
    try {
      console.log("Evaluating answers for question ID: ", questionId);
  
      // Fetch all temporary answers for the given question
      const tempAnswersQuery = query(collection(db, "temporaryAnswers"));
      const tempAnswersSnapshot = await getDocs(tempAnswersQuery);
  
      if (tempAnswersSnapshot.empty) {
        console.log("No temporary answers found for this question.");
        return;
      }
  
      // Create an array to store answers with their calculated differences
      const answersWithDifferences = [];
  
      // Loop through each document in the snapshot
      tempAnswersSnapshot.forEach((doc) => {
        const data = doc.data();
        // Assume each doc contains an array of answers
        data.answers.forEach((answerObj) => {
          if (answerObj.questionId === questionId) {
            const difference = Math.abs(
              parseFloat(answerObj.answer) - parseFloat(correctAnswer)
            );
            answersWithDifferences.push({
              user: doc.id,
              answer: answerObj.answer,
              difference,
            });
          }
        });
      });
  
      if (answersWithDifferences.length === 0) {
        console.log("No matching answers found for the question ID.");
        return;
      }
  
      // Sort the answers by their difference to the correct answer
      answersWithDifferences.sort((a, b) => a.difference - b.difference);
  
      // Award points based on sorted answers
      if (answersWithDifferences.length > 0) {
        // Award 10 points to the closest answer
        const closestAnswer = answersWithDifferences[0];
        console.log(`Closest answer: ${closestAnswer.user}`);
        await updateUserPoints(closestAnswer.user, 10);
        console.log(`Awarded 10 points to user: ${closestAnswer.user}`);
      }
  
      if (answersWithDifferences.length > 1) {
        // Award 5 points to the second closest answer
        const secondClosestAnswer = answersWithDifferences[1];
        await updateUserPoints(secondClosestAnswer.user, 5);
        console.log(`Awarded 5 points to user: ${secondClosestAnswer.user}`);
      }
  
      console.log("Answers evaluated and points awarded successfully!");
  
    } catch (error) {
      console.error("Error evaluating answers: ", error);
    }
  };
  
     
  // Function to update the user's points
  const updateUserPoints = async (userId, points) => {
      try {
          // Query the users collection to find the user with the given name
          const userQuery = query(collection(db, "competitiors"), where("name", "==", userId));
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
              // Since the name should be unique, there should be only one document in the snapshot
              const userDoc = querySnapshot.docs[0]; // get the first document
              const userRef = userDoc.ref;

              // Get the current points
              const userData = userDoc.data();
              const currentPoints = userData.point || 0;

              // Update the user's points
              await updateDoc(userRef, { point: currentPoints + points });
              console.log(`Updated points for user ${userId}: ${currentPoints + points}`);
          } else {
              console.error("User not found.");
          }
      } catch (error) {
          console.error("Error updating user points: ", error);
      }
  };
  const addPoints = async (event) => {
      event.preventDefault();

      try {
          // Tüm input alanlarındaki değerleri toplayalım
          const formData = new FormData(event.target);
          const answers = formData.getAll('answer');

          // Puanları her kullanıcıya dağıtalım
          for (let i = 0; i < selectedUsersLast.length; i++) {
              const user = selectedUsersLast[i].name;
              console.log(`Adding points for user ${user}: ${answers[i]}`);
              const points = parseInt(answers[i], 10);

              // Eğer sayı değilse hata verir
              if (isNaN(points)) {
                  console.error(`Invalid points for user ${user}: ${answers[i]}`);
                  continue;
              }

              // Kullanıcının puanlarını güncelle
              await updateUserPoints(user, points);
          }

          console.log("Points added successfully!");
      } catch (error) {
          console.error("Error adding points: ", error);
      }
  };

  const handleEvaluate = () => {
    if (currentQuestion) {
      evaluateAnswers(currentQuestion.id);
    } else {
      console.error("No question to evaluate.");
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentQuestion(null);
  };

  if (loading) {
    return <div>Loading...</div>; // Display a loading indicator while data is being fetched
  }

  return (
    <div className="question-table-container">
      <h1 className="question-table-title">Question Table</h1>
      <table className="question-table">
        <thead>
          <tr>
            <th>Kullanıcı Adı</th>
            <th>Genel Kültür</th>
            <th>Tahmin</th>
            <th>Emoji Film</th>
            <th>Hangi Dil</th>
            <th>Ünlü Sözler</th>
            <th>Hangi Şehir</th>
            <th>Anagram</th>
            <th>Daha Olası</th>
            <th>Şaka</th>
            <th>Bonus</th>
          </tr>
        </thead>
        <tbody>
          {selectedUsersLast.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              {questionTypes.map((type) => (
                <td key={type}>
                  {Array.from({ length: questionMaxLength[type] || 0 }).map(
                    (_, btnIndex) => (
                      <button
                        style={buttonStyle}
                        className="assign-button"
                        key={btnIndex}
                        onClick={() => goQuestion(user, type, btnIndex)}
                      >
                        {btnIndex + 1}
                      </button>
                    )
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="score-title">Puan Tablosu</h2>
      <table className="score-table">
        <thead>
          <tr>
            <th>Kullanıcı Adı</th>
            <th>Puan</th>
          </tr>
        </thead>
        <tbody>
          {selectedUsersLast.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{userScores[user.name] || 0}</td>{" "}
              {/* Kullanıcının puanını göster */}
            </tr>
          ))}
        </tbody>
      </table>
      <button className="reset-button" onClick={handleReset}>
        Yarışmacı Seçimini Sıfırla
      </button>

      {modalVisible && currentQuestion && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{currentQuestion.text}</h2>
            {currentQuestion.qType === "genelKültür" && (
              <p>
                A){currentQuestion.choiceA} B){currentQuestion.choiceB} C)
                {currentQuestion.choiceC} D){currentQuestion.choiceD}
              </p>
            )}
            {currentQuestion.qType === "tahmin" && (
              <button onClick={handleEvaluate}>Değerlendir</button>
            )}
            {(currentQuestion.qType === "joke"||currentQuestion.qType ==="dahaOlası") && (
              <form onSubmit={addPoints}>
                <label>
                {selectedUsersLast.map((user, index) => (<input key={index} name="answer" required className="text-input" placeholder={user.name}/>))}
                </label>
                <button type="submit" className="submit-button">
                  Cevabı Gönder
                </button>
              </form>
            )}
            <button className="close-button" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const buttonStyle = {
  margin: "5px",
  padding: "10px",
  borderRadius: "5px",
  backgroundColor: "#725C3A80",
  color: "#E5E0D8",
  cursor: "pointer",
};

export default QuestionTable;
