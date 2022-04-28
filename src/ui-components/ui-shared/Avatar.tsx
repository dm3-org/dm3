import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import makeBlockie from 'ethereum-blockies-base64';
import './Avatar.css';
import { useAsync } from './useAsync';
import * as Lib from '../../lib';
import { CacheType } from '../reducers/Cache';

export enum SpecialSize {
    Xs,
    Md,
    Lg,
}

interface AvatarProps {
    accountAddress: string;
    specialSize?: SpecialSize;
}

function Avatar(props: AvatarProps) {
    const [avatar, setAvatar] = useState<string | undefined>();
    const { state, dispatch } = useContext(GlobalContext);

    const getAvatar = async () => {
        const address = Lib.formatAddress(props.accountAddress);

        let url = state.cache.avatarUrls.get(address);

        if (url) {
            return url;
        }

        const ensName = state.cache.ensNames.get(address);

        if (ensName) {
            const urlResponse = await state.connection.provider!.getAvatar(
                ensName!,
            );

            if (urlResponse) {
                dispatch({
                    type: CacheType.AddAvatarUrl,
                    payload: { address, url: urlResponse },
                });
                return url;
            }
        }

        return undefined;
    };

    useAsync(
        getAvatar,
        (avatarUrl: unknown) => {
            setAvatar(avatarUrl as string | undefined);
        },
        [props.accountAddress, state.cache.ensNames, state.cache.avatarUrls],
    );

    if (!props.accountAddress) {
        return null;
    }

    const style = (specialSize: SpecialSize | undefined) => {
        switch (specialSize as SpecialSize) {
            case SpecialSize.Lg:
                return {
                    borderRadius: '0.5rem',
                    height: '10rem',
                };
            case SpecialSize.Md:
                return {
                    borderRadius: '0.5rem',
                    height: '3.5rem',
                };
            case SpecialSize.Xs:
                return {
                    borderRadius: '0.2rem',
                    height: '1.3rem',
                };
            default:
                return {
                    borderRadius: '0.5rem',
                    height: '2.5rem',
                };
        }
    };

    return avatar ? (
        <img
            className={'avatar'}
            src={avatar}
            style={style(props.specialSize)}
            alt="Avatar"
        />
    ) : (
        <img
            className={'avatar'}
            style={style(props.specialSize)}
            src={makeBlockie(props.accountAddress)}
            alt="Avatar"
        />
    );
}

export default Avatar;
