import React, { useContext, useEffect, useState } from 'react';

import Logo from '../assets/ENS-Mail_Signet_blue-white.svg';

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
                    ENS
                </span>
                &nbsp;
                <span style={{ color: '#fff', fontWeight: '300' }}>Mail</span>
            </div>
        </div>
    );
}

export default DarkLogo;
