import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import LoginFormPage from "./components/LoginFormPage";
import SignupFormPage from "./components/SignupFormPage";
import MyBookings from "./components/MyBookings/MyBookings";
import MySpots from "./components/MySpots/MySpots";
import Home from "./components/HomePage/HomePage";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import SpotDetails from "./components/SpotDetails/SpotDetails";
import NewBooking from "./components/NewBookingForm/NewBookingForm";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, []);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
 
      {isLoaded && (
        <Switch>
          <Route path="/login">
            <Home />
          </Route>
          <Route path="/signup">
            <SignupFormPage />
          </Route>
          <Route path="/myspots">
            <MySpots />
          </Route>
          <Route path="/mybookings">
            <MyBookings />
          </Route>
          <Route path="/spots/:spotId">
            <SpotDetails />
          </Route>
          <Route path="/:spotId/bookings">
            <NewBooking />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      )}
    </>
  );
}

export default App;