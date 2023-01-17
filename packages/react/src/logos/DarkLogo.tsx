import React, { useContext, useEffect, useState } from 'react';

import Logo from '../assets/dm3_Signet_blue-white.svg';
import './DarkLogo.css';

function DarkLogo() {
    return (
        <div
            style={{ fontSize: '35px', filter: 'brightness(90%)' }}
            className=""
        >
            <div style={{ fontSize: '12px ' }} className="text-end">
                <span
                    className="badge bg-warning text-dark"
                    style={{ borderRadius: '2px' }}
                >
                    beta 2
                </span>
            </div>
            <a href="https://dm3.network">
                <img
                    style={{
                        height: '30px',
                    }}
                    src="dm3-logo.png"
                    className="align-self-center"
                />
            </a>
        </div>
    );
}

export default DarkLogo;
