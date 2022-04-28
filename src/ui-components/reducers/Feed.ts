import * as Lib from '../../lib';
import { ActionMap } from '../reducers/shared';

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

            if (newElements.length === 0) {
                return state;
            } else {
                Lib.log(`[Feed] Add ${newElements.length} feed elements`);
                return [...state, ...newElements].sort(
                    (a, b) =>
                        Lib.getFeedElementTimestamp(b) -
                        Lib.getFeedElementTimestamp(a),
                );
            }

        default:
            return state;
    }
}
