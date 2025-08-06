import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { StreamView } from './pages/StreamView';
import { EmbedPlayer } from './pages/EmbedPlayer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stream/:streamId" element={<StreamView />} />
        <Route path="/embed/:streamId" element={<EmbedPlayer />} />
      </Routes>
    </Router>
  );
}

export default App;