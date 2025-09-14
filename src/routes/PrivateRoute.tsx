import { Navigate } from "react-router-dom";
import { getToken } from "../lib/auth";
import type { ReactElement } from "react";

export default function PrivateRoute({ children }: { children: ReactElement }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}
