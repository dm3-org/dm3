import React, { useContext, useState } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import makeBlockie from 'ethereum-blockies-base64';
import './Avatar.css';
import { useAsync } from './useAsync';
import { CacheType } from '../reducers/Cache';
import { normalizeEnsName } from 'dm3-lib-profile';

export enum SpecialSize {
    Xs,
    Md,
    Lg,
}

interface AvatarProps {
    ensName: string;
    specialSize?: SpecialSize;
}

function Avatar(props: AvatarProps) {
    const [avatar, setAvatar] = useState<string | undefined>();
    const { state, dispatch } = useContext(GlobalContext);

    const getAvatar = async () => {
        const ensName = normalizeEnsName(props.ensName);

        let url = state.cache.avatarUrls.get(ensName);

        if (url) {
            return url;
        }

        const urlResponse = await state.connection.provider!.getAvatar(
            props.ensName,
        );

        if (urlResponse) {
            dispatch({
                type: CacheType.AddAvatarUrl,
                payload: { ensName, url: urlResponse },
            });
            return url;
        }

        return undefined;
    };

    useAsync(
        getAvatar,
        (avatarUrl: unknown) => {
            setAvatar(avatarUrl as string | undefined);
        },
        [props.ensName, state.cache.avatarUrls],
    );

    if (!props.ensName) {
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
                    height: '5rem',
                };
            case SpecialSize.Xs:
                return {
                    borderRadius: '0.2rem',
                    height: '1.3rem',
                };
            default:
                return {
                    borderRadius: '4px',
                    height: '30px',
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
            src={makeBlockie(props.ensName)}
            alt="Avatar"
        />
    );
}

export default Avatar;
