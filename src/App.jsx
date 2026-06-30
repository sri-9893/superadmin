import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { UIProvider } from "./components/UIContext";

function App() {
  return (
    <UIProvider>
      <AppRoutes />
    </UIProvider>
  );
}

export default App;