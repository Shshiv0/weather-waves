import React from 'react';
import Header from './elements/Header';

function NotFound() {
  return (
    <div>
      <Header />
      <div className='NotFound'>404 Requested Page Not Found</div>
    </div>
  )
}

export default NotFound;