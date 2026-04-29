import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import Home from './LandingPage';
import Tool from './Tool';
import ResearchFinder from './ResearchFinder';
import CitationManager from './CitationManager';
import ThesisHelper from './ThesisHelper';
import ResourcesHub from './ResourcesHub';
import ThesisTopicFinder from './ThesisTopicFinder';
import StudentHub from './StudentHub';
import AppNav from './AppNav';
import StatsDirectory from './StatsDirectory';

const WithNav = () => (
  <>
    <AppNav />
    <Outlet />
  </>
);

function ResumeBuilderPlaceholder() {
  return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F5F1E8',fontFamily:"'Inter Tight',sans-serif"}}>
      <div style={{textAlign:'center',maxWidth:480,padding:40}}>
        <div style={{fontSize:48,marginBottom:16}}>🚧</div>
        <h1 style={{fontSize:28,fontWeight:700,color:'#0F1410',letterSpacing:'-0.02em',marginBottom:12}}>Resume Builder</h1>
        <p style={{fontSize:15,color:'#6B6F68',lineHeight:1.6,marginBottom:24}}>
          AI-powered resume builder is being rebuilt with a better experience. Check back soon!
        </p>
        <Link to="/" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'12px 24px',background:'#0F1410',color:'#F5F1E8',borderRadius:999,fontSize:14,fontWeight:500,textDecoration:'none'}}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<WithNav />}>
          <Route path="/tool/:toolId" element={<Tool />} />
          <Route path="/research" element={<ResearchFinder />} />
          <Route path="/citations" element={<CitationManager />} />
          <Route path="/thesis" element={<ThesisHelper />} />
          <Route path="/resources" element={<ResourcesHub />} />
          <Route path="/thesis-topics" element={<ThesisTopicFinder />} />
          <Route path="/student-hub" element={<StudentHub />} />
          <Route path="/methods" element={<StatsDirectory />} />
          <Route path="/resume-builder" element={<ResumeBuilderPlaceholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
