import React from "react";
import { Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import {
  authState,
  expertAuthState,
  superUserAuthState,
} from "../state/authState";

const ProtectedRoute = ({ component: Component }) => {
  const auth = useRecoilValue(authState);
  const expertAuth = useRecoilValue(expertAuthState);
  const superUserAuth = useRecoilValue(superUserAuthState);

  const isAuthenticated =
    auth.isLoggedIn || expertAuth.isLoggedIn || superUserAuth.isLoggedIn;

  return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
