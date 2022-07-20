import React, { useContext, useEffect, useState } from 'react';

import Logo from '../assets/dm3_Signet_blue-white.svg';

function DarkLogo() {
    return (
        <div
            style={{ fontSize: '35px', filter: 'brightness(90%)' }}
            className="d-flex"
        >
            <img
                style={{
                    width: '50px',
                }}
                src={Logo}
                className="align-self-center"
            />
            <div className="align-self-center">
                <span
                    className="ms-3"
                    style={{ fontWeight: '600', color: '#fff' }}
                >
                    dm
                </span>
                <span style={{ fontWeight: '400', color: '#fff' }}>3</span>
            </div>
        </div>
    );
}

export default DarkLogo;
