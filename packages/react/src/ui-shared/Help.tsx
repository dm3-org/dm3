import React from 'react';
import './Help.css';
import Arrow from '../assets/arrow.svg';

function Help() {
    return (
        <div className="row help-row">
            <div className="col-12 d-flex mb-1">
                <div
                    style={{
                        marginLeft: '18px',
                    }}
                >
                    <img
                        style={{
                            width: '50px',
                        }}
                        src={Arrow}
                        className="align-self-center"
                    />
                </div>
                <div className="align-self-center ms-1 pb-1">
                    Click here to add a new contact.
                </div>
            </div>
        </div>
    );
}

export default Help;
