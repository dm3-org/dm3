import React, { useContext, useEffect, useState } from 'react';
import Icon from '../ui-shared/Icon';
import * as Lib from '../../lib';
import { GlobalContext } from '../GlobalContextProvider';

interface InfoBoxProps {
    text: string;
}

function InfoBox(props: InfoBoxProps) {
    return (
        <div className="alert alert-warning w-100 info-box" role="alert">
            {props.text}
        </div>
    );
}

export default InfoBox;
