import React, { useEffect, useState } from "react";
import { db } from "./database";
import { collection, getDocs } from "firebase/firestore";
import '../App.css';
import QuestionTable from "./QuestionTable";
import { useNavigate } from "react-router-dom";
import { useSelectedUsers } from './SelectedUsers'; // import the custom hook

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const { selectedUsersLast, setSelectedUsersLast } = useSelectedUsers(); // use the custom hook
  const navigation = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, "competitiors");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id, 
        ...doc.data(),
      }));
      setUsers(usersList);
    };
    fetchUsers();
  }, []);
  
  const handleUserSelection = (user, event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setSelectedUsersLast(prevSelected => [...prevSelected, user]);
    } else {
      setSelectedUsersLast(prevSelected =>
        prevSelected.filter(selectedUser => selectedUser.id !== user.id)
      );
    }
  };

  const startCompetition = () => {
    console.log("Selected Users: ", selectedUsersLast);
    navigation("/QuestionTable");
    // Burada yarışmayı başlatmak için gerekli işlemleri yapabilirsiniz.
  };

  return (
    <div className="admin-panel">
      <h1>Yarışmacı Seçimi</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
          <input
            type="checkbox"
            onChange={(event) => handleUserSelection(user, event)}
          />
          {user.name} {/* Kullanıcı adını göster */}
        </li>
        ))}
      </ul>
      <button onClick={startCompetition}>Yarışmayı Başlat</button>
    </div>
  );
}

export default AdminPanel;
