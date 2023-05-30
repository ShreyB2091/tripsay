import React from 'react';
import logo from '../logo.jpeg';
import Image from 'next/image';

export default function Navbar() {
  return (
    <div className="navbar bg-base-100navbar bg-neutral text-neutral-content">
      <div className="normal-case text-xl top-0 ml-8 my-1">
        <Image src={logo} alt="TripSay" className="h-16 w-auto rounded-lg" />
      </div>
    </div>
  );
}