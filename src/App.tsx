
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Kambaz from './Kambaz';
import { Provider } from 'react-redux';
import store from "./Kambaz/store";
import QuizResults from './Kambaz/Courses/Quizzes/QuizResult';


function App() {
  return (
    <HashRouter>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Navigate to="/Kambaz" />} />
          <Route path="/Kambaz/*" element={<Kambaz />} />
          <Route path="/Kambaz/Courses/:cid/Quizzes/:quizId/result" element={<QuizResults />} />
        </Routes>
      </Provider>
    </HashRouter>
  );
}

export default App;