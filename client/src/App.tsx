import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import LoginPage from "./components/LoginPage/LoginPage";
import TaskList from "./components/TaskList/TaskList";
import ProtectedRoute from "./ui/ProtectedRoute/ProtectedRoute";
import { initializeAuth } from "./store/slices/authSlice";

function App() {
  useEffect(() => {
    console.log("Initializing app, checking authentication...");
    store.dispatch(initializeAuth());
  }, []);

  return (
    <BrowserRouter>
      <Provider store={store}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/tasks" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TaskList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
