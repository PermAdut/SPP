import { Navigate } from "react-router";
import { useAppSelector } from "../../hooks/redux";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, isAuth } = useAppSelector((state) => state.auth);
  if (!isAuth && !isLoading) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
