import './App.css';
import AppV1 from './components/v1/App';
import { WindowProvider } from './contexts/Window.context';

function App() {
  return (
    <>
      <WindowProvider>
        <AppV1 />
      </WindowProvider>
    </>
  )
}

export default App
