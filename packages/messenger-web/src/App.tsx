// Import CSS and JS from Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import the global CSS file
import './App.css';

// Import the components
import Background from './Background';
import Dm3Widget from './Dm3Widget';
import Footer from './Footer';
import Header from './Header';

// The main component of the application
function App() {
    // The components are rendered in the order they should appear
    return (
        <div className="App">
            <Background />
            <Header />
            <Footer />
            <Dm3Widget />
        </div>
    );
}

// Export the App component as the default export
export default App;
