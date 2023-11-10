import React from 'react';
import './Background.css';

const Background: React.FC = () => {
    return (
        <div className="background">
            <div className="gradient gradient-right" />
            <div className="gradient gradient-left" />
        </div>
    );
};

export default Background;
