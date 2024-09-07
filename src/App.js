import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import Starter from "./components/Starter";
import Exit from "./components/Exit";
import React from "react";
import Login from "./components/Login";
import AdminPanel from "./components/AdminPanel"; 
import { UserProvider } from "./components/UserContext";
import { QuestionProvider } from './components/QuestionContext';
import { SelectedUsersProvider } from "./components/SelectedUsers"; 
import GenelQuestion from "./components/Questions/GenelQuestion";
import EsprituelQuestion from "./components/Questions/Esprituel";
import EmojilerleFilmQuestion from "./components/Questions/EmojilerleFilmQuestion";
import TahminQuestion from "./components/Questions/TahminQuestion";
import QuestionTable from "./components/QuestionTable";

function App() {
  return (
    <SelectedUsersProvider>
    <QuestionProvider>
    <UserProvider>
    <BrowserRouter>
      <main>
        <h1 style={{fontSize:"50px", marginLeft:"40%", color:"#809671"}}>Yarışmacı Sizsiniz</h1>
        <Routes>
          <Route
            path="/"
            element={
              <TransitionGroup>
                <CSSTransition key="home" timeout={0} classNames="fade">
                  <Login />
                </CSSTransition>
              </TransitionGroup>
            }
          />
          <Route
            path="/starter"
            element={
              <TransitionGroup>
                <CSSTransition key="starter" timeout={0} classNames="fade">
                  <Starter />
                </CSSTransition>
              </TransitionGroup>
            }
          />
          <Route
            path="/exit"
            element={
              <TransitionGroup>
                <CSSTransition key="exit" timeout={0} classNames="fade">
                  <Exit />
                </CSSTransition>
              </TransitionGroup>
            }
          />
          <Route
          path="/adminPanel"
          element={
            <TransitionGroup>
              <CSSTransition key="adminPanel" timeout={0} classNames="fade">
                <AdminPanel />
              </CSSTransition>
            </TransitionGroup>
          }
        />
        <Route 
        path="/GenelQuestion"
        element={
          <TransitionGroup>
            <CSSTransition key="GenelQuestion" timeout={0} classNames="fade">
              <GenelQuestion />
            </CSSTransition>
          </TransitionGroup>
        }
        />
        <Route
        path="/EsprituelQuestion"
        element={
          <TransitionGroup>
            <CSSTransition key="EsprituelQuestion" timeout={0} classNames="fade">
              <EsprituelQuestion />
            </CSSTransition>
          </TransitionGroup>
        }
        />
        <Route
        path="/EmojilerleFilmQuestion"
        element={
          <TransitionGroup>
            <CSSTransition key="EmojilerleFilmQuestion" timeout={0} classNames="fade">
              <EmojilerleFilmQuestion />
            </CSSTransition>
          </TransitionGroup>
        }
        />
        <Route
        path="/TahminQuestion"
        element={
          <TransitionGroup>
            <CSSTransition key="TahminQuestion" timeout={0} classNames="fade">
              <TahminQuestion />
            </CSSTransition>
          </TransitionGroup>
        }
        />
        <Route
        path="/QuestionTable"
        element={
          <TransitionGroup>
            <CSSTransition key="QuestionTable" timeout={0} classNames="fade">
              <QuestionTable />
            </CSSTransition>
          </TransitionGroup>
        }
        />
        </Routes>
      </main>
    </BrowserRouter>
    </UserProvider>
    </QuestionProvider>
    </SelectedUsersProvider>
  );
}

export default App;
