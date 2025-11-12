import { Navigate } from "react-router";
import { useAppSelector } from "../../hooks/redux";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, isAuth, initialized } = useAppSelector((state) => state.auth);

  // Если инициализация еще не завершена, показываем загрузку
  if (!initialized && isLoading) {
    return <div>Loading...</div>;
  }

  // Если инициализация завершена и пользователь не авторизован
  if (initialized && !isAuth) {
    return <Navigate to="/login" />;
  }

  // Если пользователь авторизован или идет процесс инициализации
  return <>{children}</>;
};

export default ProtectedRoute;
