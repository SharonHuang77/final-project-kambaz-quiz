
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Kambaz from './Kambaz';
import { Provider } from 'react-redux';
import store from "./Kambaz/store";


function App() {
  return (
    <HashRouter>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Navigate to="/Kambaz" />} />
          <Route path="/Kambaz/*" element={<Kambaz />} />
        </Routes>
      </Provider>
    </HashRouter>
  );
}

export default App;