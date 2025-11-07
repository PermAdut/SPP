import { useEffect } from "react";
import { Provider } from "react-redux";
import { ApolloProvider } from "@apollo/client";
import { store } from "./store/store";
import { apolloClient } from "./graphql/apolloClient";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import LoginPage from "./components/LoginPage/LoginPage";
import TaskList from "./components/TaskList/TaskList";
import ProtectedRoute from "./ui/ProtectedRoute/ProtectedRoute";

function App() {
  useEffect(() => {
    // Apollo Client автоматически обрабатывает аутентификацию через заголовки
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
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
    </ApolloProvider>
  );
}

export default App;
