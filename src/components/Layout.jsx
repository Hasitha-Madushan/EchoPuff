// src/components/Layout.jsx
import React from 'react';
import Header from './Header';

import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* This will render the content of the current page */}
      </main>
    </>
  );
};



export default Layout;
