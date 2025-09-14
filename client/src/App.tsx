import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter, Route, Routes } from "react-router";
import AddForm from "./components/AddForm/AddForm";
import UserList from "./components/UserList/UserList";

function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
          <Routes>
            <Route path="/" element={<UserList />} />
            <Route path="/new" element={<AddForm />} />
          </Routes>
      </Provider>
    </BrowserRouter>
  );
}

export default App;