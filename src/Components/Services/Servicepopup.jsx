import React from 'react';
import './Servicepopup.css'
function Servicepopup({ info, closePopup }) {
  return (
    <div className='Serviceall'>
      {info && (
        <div className='Servicepopup'>
          <div>{info.title}</div>
          <div>{info.details}</div>
          {/* Add more information as needed */}
          <button className='Close' onClick={closePopup}>X</button>
        </div>
      )}
    </div>
  );
}

export default Servicepopup;
