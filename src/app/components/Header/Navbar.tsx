"use client"
import React, { useEffect, useState } from 'react';
import TopinfoBar from './TopinfoBar';
import Header from './Header';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <TopinfoBar />
      <div className="sticky top-0 z-50">
        <Header scrolled={scrolled} />
      </div>
    </>
  );
};

export default Navbar;
