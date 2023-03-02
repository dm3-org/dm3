import React, { useContext, useEffect, useState } from 'react';

import Logo from '../assets/dm3_Signet_blue-white.svg';
import './DarkLogo.css';

interface DarkLogoProps {
    secondary?: boolean;
}

function DarkLogo(props: DarkLogoProps) {
    return (
        <div>
            <a href="https://dm3.network">
                <img
                    src="dm3-logo.png"
                    className="align-self-center"
                    style={
                        props.secondary
                            ? { filter: 'opacity(0.4) grayscale(1)' }
                            : {}
                    }
                />
            </a>

            {!props.secondary && (
                <div style={{ fontSize: '18px ' }} className="text-end">
                    <span
                        className="badge bg-warning text-dark"
                        style={{ borderRadius: '4px' }}
                    >
                        beta 2
                    </span>
                </div>
            )}
        </div>
    );
}

export default DarkLogo;
