import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter, Route, Routes } from 'react-router';

/**
 * The entry point of the React application.
 * 
 * This renders the `App` component inside a `BrowserRouter` with routing configured.
 * The `React.StrictMode` wrapper helps identify potential problems in the app.
 * 
 * @function
 * @returns {React.Element} The root React element that is rendered to the DOM.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
