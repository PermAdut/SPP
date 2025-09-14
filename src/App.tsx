import { lazy, Suspense } from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Route, Routes } from "react-router";
import AddForm from "./components/AddForm/AddForm";

const UserList = lazy(() => import("./components/UserList/UserList"));

function App({ Router, routerProps }: { Router: any; routerProps?: any }) {
  return (
    <Router {...routerProps}>
      <Provider store={store}>
        <Suspense fallback={<div>Failed to load...</div>}>
          <Routes>
            <Route path="*" element={<UserList />} />
            <Route path="/new" element={<AddForm />} />
          </Routes>
        </Suspense>
      </Provider>
    </Router>
  );
}

export default App;