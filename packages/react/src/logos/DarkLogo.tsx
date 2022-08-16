import React, { useContext, useEffect, useState } from 'react';

import Logo from '../assets/dm3_Signet_blue-white.svg';
import './DarkLogo.css';

function DarkLogo() {
    return (
        <div
            style={{ fontSize: '35px', filter: 'brightness(90%)' }}
            className="d-flex"
        >
            <a href="https://dm3.network">
                <img
                    style={{
                        width: '50px',
                    }}
                    src={Logo}
                    className="align-self-center"
                />
            </a>
            <div className="align-self-center ms-3">
                <div style={{ fontSize: '12px ' }} className="text-end">
                    <span className="badge bg-warning text-dark">beta</span>
                </div>
                <div>
                    <a href="https://dm3.network" className="logo-link">
                        <span style={{ fontWeight: '600', color: '#fff' }}>
                            dm
                        </span>
                        <span style={{ fontWeight: '400', color: '#fff' }}>
                            3
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default DarkLogo;
