import React from "react";
import { Link } from "react-router-dom";

function ListGroup() {
  return (
    <div className="list-group">
      <h2>Choose an Option</h2>
      <div className="divider">yarışmacı sizsiniz artık yeni bir boyutta cebinizde</div>
      <ul>
        <li>
          <Link to="/starter">Starter</Link>
        </li>
        <li>
          <Link to="/exit">Exit</Link>
        </li>
      </ul>
    </div>
  );
}

export default ListGroup;
