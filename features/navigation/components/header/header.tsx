'use client'; 

import { useState } from 'react';
import HeaderView from './header-view';


export default function header({...props}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  return <HeaderView isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} isAdmin={props.isAdmin}/>;
}

