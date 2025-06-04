
import { HashRouter, Routes } from 'react-router-dom';
import Kambaz from './Kambaz';
import { Provider } from 'react-redux';
import store from "./Kambaz/store";


function App() {
  

  return (
    <>
    <HashRouter>
      <Provider store = {store}>
        <div>
          <Routes>
            <Kambaz />
          </Routes>
        </div>
      </Provider>
    </HashRouter>
    </>
  )
}

export default App
