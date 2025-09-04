import { lazy, Suspense } from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";

function App() {
  const UserList = lazy(() => import("./components/UserList/UserList"));
  return (
    <Provider store={store}>
      <Suspense fallback={<div>Failed to load...</div>}>
        <UserList />
      </Suspense>
    </Provider>
  );
}

export default App;
