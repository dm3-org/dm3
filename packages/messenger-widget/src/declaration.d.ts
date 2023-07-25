// To support images with extensions png, jpg and gif
declare module '*.png';
declare module '*.gif';
declare module '*.jpg';

declare module 'localforage' {
    let localforage: LocalForage;
    export = localforage;
}
