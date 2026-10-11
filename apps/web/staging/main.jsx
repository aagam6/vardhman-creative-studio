import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,Link} from 'react-router-dom';
import AyambilEveningPage from '../src/pages/AyambilEveningPage.jsx';
import AyambilPassDownloadPage from '../src/pages/AyambilPassDownloadPage.jsx';
import AyambilAdminPage from '../src/pages/AyambilAdminPage.jsx';
import '../src/index.css';
function Selection(){return <main className="ay-page ay-container"><h1>Ayambil evening booking</h1><p>Temporary test site</p><p><Link to="/500-akhand-ayambil-vijayollas/manan-sanghvi">2 November — Manan Sanghvi</Link></p><p><Link to="/500-akhand-ayambil-vijayollas/sairam-dave">3 November — Sairam Dave</Link></p></main>;}
function Unavailable(){return <main><h1>Page unavailable</h1><p>This temporary site provides Ayambil booking only.</p><Link to="/">Choose an evening</Link></main>;}
createRoot(document.getElementById('root')).render(<BrowserRouter><Routes>
 <Route path="/" element={<Selection/>}/>
 <Route path="/500-akhand-ayambil-vijayollas" element={<Selection/>}/>
 <Route path="/500-akhand-ayambil-vijayollas/manan-sanghvi" element={<AyambilEveningPage eventDate="2026-11-02"/>}/>
 <Route path="/500-akhand-ayambil-vijayollas/sairam-dave" element={<AyambilEveningPage eventDate="2026-11-03"/>}/>
 <Route path="/500-akhand-ayambil-vijayollas/passes" element={<AyambilPassDownloadPage/>}/>
 <Route path="/admin/ayambil" element={<AyambilAdminPage/>}/>
 <Route path="*" element={<Unavailable/>}/>
</Routes></BrowserRouter>);
