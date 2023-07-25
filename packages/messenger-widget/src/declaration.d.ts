declare module "*.png";
declare module "*.gif";
declare module "*.jpg";

declare module "localforage" {
  let localforage: LocalForage;
  export = localforage;
}
