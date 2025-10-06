import { useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/User/Navbar/Navbar';
import AllUserRoutes from './routes/AllUserRoutes';
import AIChatButton from './components/User/Chat/AIChatButton';
import "./App.css";

function App() {
    return (

        <div className="min-h-screen bg-bg">
            <Router>
                <Navbar />
                <AllUserRoutes />
                <AIChatButton />
            </Router>

        </div>
    );
}

export default App;