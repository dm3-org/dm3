import * as Lib from '../../lib';
import { ActionMap, GlobalState } from './shared';

export enum EnsNameType {
    AddEnsName = 'ADD_ENS_NAME',
}

export type EnsNamePayload = {
    [EnsNameType.AddEnsName]: { address: string; name: string };
};

export type EnsNamesActions =
    ActionMap<EnsNamePayload>[keyof ActionMap<EnsNamePayload>];

export function ensNamesReducer(
    state: Map<string, string>,
    action: EnsNamesActions,
) {
    switch (action.type) {
        case EnsNameType.AddEnsName:
            Lib.log(
                `New ens name ${action.payload.name} for ${action.payload.address}`,
            );
            state.set(action.payload.address, action.payload.name);
            return new Map(state);

        default:
            return state;
    }
}
