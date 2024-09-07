import React, { useContext, useState } from "react";
import { UserContext } from "./UserContext";
import { db } from "./database";
import {
  updateDoc,
  query,
  where,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import QuestionModal from "./ModalComponent"; // Modal componentini import et

function Starter() {
  const { user, setUser } = useContext(UserContext);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const pointInc = async () => {
    try {
      console.log(user.name);
      const userQuery = query(
        collection(db, "competitiors"),
        where("name", "==", user.name)
      );
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        const userDocRef = querySnapshot.docs[0].ref;
        const userDoc = querySnapshot.docs[0].data();
        await updateDoc(userDocRef, { point: (userDoc.point || 0) + 1 });
        setUser({ ...user, point: (userDoc.point || 0) + 1 });
      } else {
        setError("User document not found.");
      }
    } catch (error) {
      console.error("Error updating document: ", error);
      setError("An error occurred while updating the document.");
    }
  };
  const pointDec = async () => {
    try {
      console.log(user.name);
      const userQuery = query(
        collection(db, "competitiors"),
        where("name", "==", user.name)
      );
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        const userDocRef = querySnapshot.docs[0].ref;
        const userDoc = querySnapshot.docs[0].data();
        await updateDoc(userDocRef, { point: (userDoc.point || 0) - 1 });
        setUser({ ...user, point: (userDoc.point || 0) - 1 });
      } else {
        setError("User document not found.");
      }
    } catch (error) {
      console.error("Error updating document: ", error);
      setError("An error occurred while updating the document.");
    }
  };

  const handleQuestionButtonClick = (questionType) => {
    const currentQuestion = JSON.parse(localStorage.getItem("currentQuestion"));
    console.log("Current Question: ", currentQuestion);
    setCurrentQuestion(currentQuestion);
    setModalVisible(true);
  };

  const handleAnswerSubmit = async (answer) => {
    // LocalStorage'dan mevcut soruyu alın
    const currentQuestion = JSON.parse(localStorage.getItem("currentQuestion"));

    if (!currentQuestion) {
      setError("Bir sorun oluştu. Lütfen tekrar deneyin.");
      return;
    }
    if (
      currentQuestion.qType === "genelKültür" ||
      currentQuestion.qType === "emojiMovie" ||
      currentQuestion.qType === "hangiDil" ||
      currentQuestion.qType === "ünlüSöz" ||
      currentQuestion.qType === "hangiŞehir" ||
      currentQuestion.qType === "anagram"
    ) {
      // Eğer cevap doğruysa
      if (answer === currentQuestion.correctAnswer) {
        // Firebase'deki kullanıcı belgesini güncelleyin
        try {
          const userQuery = query(
            collection(db, "competitiors"),
            where("name", "==", user.name)
          );
          const querySnapshot = await getDocs(userQuery);
          if (!querySnapshot.empty) {
            const userDocRef = querySnapshot.docs[0].ref;
            const userDoc = querySnapshot.docs[0].data();
            if (currentQuestion.qType === "hangiDil" || currentQuestion.qType === "ünlüSöz") {
              await updateDoc(userDocRef, { point: (userDoc.point || 0) + 10 });
              setUser({ ...user, point: (userDoc.point || 0) + 10 });
            }
            await updateDoc(userDocRef, { point: (userDoc.point || 0) + 5 });
            setUser({ ...user, point: (userDoc.point || 0) + 5 });
          } else {
            setError("User document not found.");
          }
          console.log("Puan güncellendi ve doğru cevap verildi!");
        } catch (error) {
          console.error("Puan güncellenirken bir hata oluştu: ", error);
          setError(
            "Puan güncellenirken bir hata oluştu. Lütfen tekrar deneyin."
          );
        }
      } else {
        setError("Yanlış cevap, puan eklenmedi.");
      }
    } else if (currentQuestion.qType === "tahmin") {
        try {
            const tempAnswersRef = doc(db, "temporaryAnswers", user.name);
            const tempAnswersSnapshot = await getDoc(tempAnswersRef);

            if (tempAnswersSnapshot.exists()) {
                const tempAnswers = tempAnswersSnapshot.data().answers || [];
                tempAnswers.push({ questionId: currentQuestion.id, answer });
                await updateDoc(tempAnswersRef, { answers: tempAnswers });
            } else {
                await setDoc(tempAnswersRef, { answers: [{ questionId: currentQuestion.id, answer }] });
            }

            console.log("Tahmin cevabı geçici olarak kaydedildi!");
        } catch (error) {
            console.error("Tahmin cevabı kaydedilirken bir hata oluştu: ", error);
            setError("Tahmin cevabı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
        }
    }
    else if (currentQuestion.qType === "dahaOlası" || currentQuestion.qType === "joke") {
      try {
        const tempAnswersRef = doc(db, "temporaryAnswers", user.name);
        const tempAnswersSnapshot = await getDoc(tempAnswersRef);

        if (tempAnswersSnapshot.exists()) {
          const tempAnswers = tempAnswersSnapshot.data().answers || [];
          tempAnswers.push({ questionId: currentQuestion.id, answer });
          await updateDoc(tempAnswersRef, { answers: tempAnswers });
        } else {
          await setDoc(tempAnswersRef, { answers: [{ questionId: currentQuestion.id, answer }] });
        }

        console.log("Cevap geçici olarak kaydedildi!");
      } catch (error) {
        console.error("Cevap kaydedilirken bir hata oluştu: ", error);
        setError("Cevap kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    }
    setModalVisible(false); // Modal'ı kapat
  };

  return (
    <div className="starter">
      <h2>Kurallar</h2>
      <p>
        Yarışmacı Sizsiniz artık daha interaktif ve daha eğlenceli. Bu oyunda
        sizin için hazırlanmış soruları cevaplayarak puan kazanabilirsiniz.
        Farklı kategorilerde sorularımız bulunmaktadır. Her soru için belirli
        bir süreniz vardır. Süre bitmeden soruyu cevaplamanız gerekmektedir. En
        çok puanı toplayan yarışmacı kazanır.
      </p>
      <p>
        Bu yarışmada bazı jokerleriniz bulunmaktadır. Bu jokerler sırasıyla **Kişisel Asistana sor**, **Riskli Bomba**, **Dost Kurşunu**, **Yarım Olsun Benim Olsun**, **Bencil Ben**. 
      </p>
      <h2>Yarışmacı Bilgileri</h2>
      <h2>
        Kullanıcı adı: {user.name}, {user.point} puan
      </h2>
      <h4>Cevaplamak istediğiniz soruyu seçiniz.</h4>
      <button onClick={() => handleQuestionButtonClick("genelKültür")}>
        Genel Kültür
      </button>
      <button onClick={() => handleQuestionButtonClick("tahmin")}>
        Tahmin
      </button>
      <button onClick={() => handleQuestionButtonClick("emojiMovie")}>
        Emoji Film
      </button>
      <button onClick={() => handleQuestionButtonClick("hangiDil")}>
        Hangi Dil
      </button>
      <button onClick={() => handleQuestionButtonClick("ünlüSöz")}>
        Ünlü Söz
      </button>
      <button onClick={() => handleQuestionButtonClick("hangiŞehir")}>
        Hangi Şehir
      </button>
      <button onClick={() => handleQuestionButtonClick("anagram")}>
        Anagram
      </button>
      <button onClick={() => handleQuestionButtonClick("dahaOlası")}>
        Olası Senaryo
      </button>
      <button onClick={() => handleQuestionButtonClick("joke")}>
        Şaka
      </button>
      <button onClick={pointInc}>+1</button>
      <button onClick={pointDec}>-1</button>
      {error && <p className="error">{error}</p>}

      {/* Modal Component */}
      <QuestionModal
        isVisible={modalVisible}
        question={currentQuestion}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAnswerSubmit}
      />
    </div>
  );
}

export default Starter;
