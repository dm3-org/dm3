import React, { Dispatch } from 'react';
import * as Lib from '../../lib';
import { ActionMap } from '../reducers/shared';
import Feed from './Feed';

export enum FeedType {
    AddFeedElements = 'ADD_FEED_ELEMENTS',
}

export type FeedPayload = {
    [FeedType.AddFeedElements]: Lib.FeedElment[];
};

export type FeedActions = ActionMap<FeedPayload>[keyof ActionMap<FeedPayload>];

export function feedReducer(
    state: Lib.FeedElment[],
    action: FeedActions,
): Lib.FeedElment[] {
    switch (action.type) {
        case FeedType.AddFeedElements:
            const newElements = action.payload.filter((element) =>
                state.find(
                    (oldElement) =>
                        Lib.getFeedElementId(oldElement) ===
                        Lib.getFeedElementId(element),
                )
                    ? false
                    : true,
            );
            Lib.log(`Add ${newElements.length} feed elements`);
            return [...state, ...newElements].sort(
                (a, b) =>
                    Lib.getFeedElementTimestamp(b) -
                    Lib.getFeedElementTimestamp(a),
            );

        default:
            return state;
    }
}

export const FeedContext = React.createContext<{
    state: Lib.FeedElment[];
    dispatch: Dispatch<FeedActions>;
}>({ state: [], dispatch: () => null });

function FeedContextProvider() {
    const [state, dispatch] = React.useReducer(feedReducer, []);

    return (
        <FeedContext.Provider value={{ state, dispatch }}>
            <Feed />
        </FeedContext.Provider>
    );
}

export default FeedContextProvider;
