import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './App.css';

import Background from './Background';
import Dm3Widget from './Dm3Widget';
import Footer from './Footer';
import Header from './Header';



function App() {


    return (
        <div className="App">
            <Header />
            <Background />
            <Dm3Widget />
            <Footer />

        </div>
    );
}

export default App;
