import React, { useContext, useEffect, useState } from 'react';

import Logo from '../assets/dm3_Signet_blue-white.svg';
import './DarkLogo.css';

function DarkLogo() {
    return (
        <div>
            <a href="https://dm3.network">
                <img src="dm3-logo.png" className="align-self-center" />
            </a>
            <div style={{ fontSize: '18px ' }} className="text-end">
                <span
                    className="badge bg-warning text-dark"
                    style={{ borderRadius: '4px' }}
                >
                    beta 2
                </span>
            </div>
        </div>
    );
}

export default DarkLogo;
