// src/App.js
import "./App.css";
import Navbar from "./components/Navbar";
import DevAuthIndicator from "./components/DevAuthIndicator";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <AuthProvider>
          <Navbar />
          <DevAuthIndicator />
          <AppRoutes />
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
