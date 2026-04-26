
import './App.css';
import { Routes , Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';



function App() {
  return (
    <div className="App">
      <Routes>
         <Route path='/' element={<LoginPage/>}/>
         <Route path='/chat' element={<ChatPage/>}/>
      </Routes>
    </div>
  );
}

export default App;
