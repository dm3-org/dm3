import './Preferences.css';
import { preferencesItems } from './bl';
import infoIcon from "./../../assets/images/preferences-info.svg";
import backIcon from "./../../assets/images/back.svg";
import { useState } from 'react';

export function Preferences() {

    const [optionChoosen, setOptionChoosen] = useState<any>(null);

    return (
        <div>
            <div
                id="preferences-modal"
                className="modal-container position-fixed w-100 h-100"
            >
                <div
                    className="preferences-modal-content border-radius-6 
            background-container text-primary-color"
                >
                    <div className="row m-0 h-100 w-100">
                        <div className='col-2 m-0 p-0 preferences-aside-content border-radius-6'>
                            <div className='pt-3 d-flex align-items-center'>
                                {
                                    <span className={optionChoosen ? "" : "invisible"}>
                                        <img className='back-icon' src={backIcon} alt="back"
                                            onClick={() => setOptionChoosen(null)} />
                                    </span>
                                }
                                <span>
                                    <h3 className='text-primary-color d-flex justify-content-center mb-0'>
                                        Preferences
                                    </h3>
                                </span>
                            </div>

                            <hr className='preferences-separator' />
                            {preferencesItems.map((item, index) => {
                                return <div
                                    className={'target d-flex preferences-item '.concat(" ",
                                        (optionChoosen && optionChoosen.name === item.name) ? "normal-btn-hover" : "")}
                                    key={index}
                                    onClick={() => setOptionChoosen(item)}
                                >
                                    {item.image}
                                    {item.name}
                                </div>;
                            })}

                            <div className='d-flex text-primary-color preferences-info'>
                                <span className='d-flex pointer-cursor'>
                                    <img src={infoIcon} alt="info" className="me-2" />
                                    Information
                                </span>
                            </div>
                        </div>
                        <div className='col-10 m-0 p-0'>
                            {optionChoosen && optionChoosen.component}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
