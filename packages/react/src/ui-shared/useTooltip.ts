import React, { useContext, useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { Tooltip } from 'bootstrap';

function useTooltip(
    text: string,
    placement: Tooltip.PopoverPlacement,
    triggerTextSize: number,
    customClass?: string,
) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    let tooltip: Tooltip | null = null;

    useEffect(() => {
        if (
            tooltipRef.current &&
            text.length > triggerTextSize &&
            text.length > 0
        ) {
            tooltip = new Tooltip(tooltipRef.current, {
                title: text,
                placement,
                trigger: 'hover',
                customClass,
            });
        }
        if (tooltip && text.length <= triggerTextSize && text.length === 0) {
            tooltip.dispose();
        }
        return () => {
            if (tooltip) {
                tooltip.dispose();
            }
        };
    }, [text, placement, triggerTextSize, customClass]);

    return tooltipRef;
}

export default useTooltip;
