import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Estimation from "./pages/Estimation";
import Login from "./pages/Login";
import PrivateRoute from "./routes/PrivateRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Versions from "./pages/admin/Versions";
import Subscriptions from "./pages/admin/Subscriptions";
import Settings from "./pages/admin/Settings";
import Prevoyance from "./pages/Prevoyance";
import Souscription from "./pages/Souscription";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/estimation" element={<Estimation/>}/>
        <Route path="/souscription" element={<Souscription />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="prevoyance" element={<Prevoyance/>}/>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout/>
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace/>}/>
          <Route path="dashboard" element={<Dashboard/>}/>
          <Route path="products" element={<Products/>}/>
          <Route path="versions" element={<Versions/>}/>
          <Route path="subscriptions" element={<Subscriptions/>}/>
          <Route path="settings" element={<Settings/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
