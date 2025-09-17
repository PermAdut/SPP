import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter, Route, Routes } from "react-router";
import AddForm from "./components/AddForm/AddForm";
import UserList from "./components/UserList/UserList";
import LoginPage from "./components/LoginPage/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<UserList />} />
          <Route path="/new" element={<AddForm />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
