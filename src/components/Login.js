import React, { useContext } from "react";
import { db } from "./database";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext"; // Import your UserContext

function Login() {
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isCheck, setIsCheck] = React.useState(false);
  const { setUser } = useContext(UserContext); // Use the correct context
  const navigate = useNavigate(); 

  const checkLogin = async (event) => {
    event.preventDefault(); 
    console.log("Checking login...");

    if (name === "" || password === "") {
      console.log("Please fill all fields");
      return;
    } else if (name === "admin" && password === "admin") {
      console.log("Login successful");
      setIsCheck(true);
      setUser({ name, password }); 
      navigate("/adminPanel"); 
    } else {
      const q = query(
        collection(db, "competitiors"),
        where("name", "==", name),
        where("password", "==", password) 
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        console.log("Login successful");
        setIsCheck(true);
        console.log("User data:", querySnapshot.docs[0].data());
        setUser(querySnapshot.docs[0].data()); 
        navigate("/starter"); 
      } else {
        console.log("Invalid credentials");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>
        <form onSubmit={checkLogin}>
          <div className="form-control">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-input"
            />
          </div>
          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-input"
            />
          </div>
          <button type="submit" className="submit-button">Login</button>
        </form>
        {isCheck && <p className="success-message">Login was successful!</p>}
      </div>
    </div>
  );
}

export default Login;
