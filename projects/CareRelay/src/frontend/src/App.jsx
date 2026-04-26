import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import DisclaimerBanner from './components/DisclaimerBanner';
import Snapshot from './pages/Snapshot';
import DeepDive from './pages/DeepDive';
import IDCard from './pages/IDCard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Snapshot />} />
            <Route path="/history" element={<DeepDive />} />
            <Route path="/card" element={<IDCard />} />
          </Routes>
        </main>
        <DisclaimerBanner />
      </div>
    </BrowserRouter>
  );
}
