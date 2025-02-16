import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import ApiRouter from './api/apiRouter';
import { SpotifyAuthContextProvider } from './api/apiUtil';

function App() {
    return (
        <SpotifyAuthContextProvider>
            <ApiRouter />
        </SpotifyAuthContextProvider>
    );
}

export default App;
