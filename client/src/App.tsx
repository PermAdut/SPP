import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import LoginPage from "./components/LoginPage/LoginPage";
import TaskList from "./components/TaskList/TaskList";
import ProtectedRoute from "./ui/ProtectedRoute/ProtectedRoute";

function App() {
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
