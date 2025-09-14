import { Navigate } from "react-router-dom";
import { getToken } from "../lib/auth";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}
