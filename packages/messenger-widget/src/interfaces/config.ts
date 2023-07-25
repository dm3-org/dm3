import { StorageLocation } from 'dm3-lib-storage';

export interface Config {
  defaultContact?: string;
  showContacts: boolean;
  inline: boolean;
  defaultStorageLocation: StorageLocation;
  hideStorageSelection: boolean;
  style: React.CSSProperties;
  defaultServiceUrl: string;
  showAlways: boolean;
  miniSignIn: boolean;
  connectionStateChange?: (newState: any) => void;
  warnBeforeLeave: boolean;
  browserStorageBackup: boolean;
  showHelp: boolean;
  theme: string | undefined | null;
}

export interface Dm3Props {
  config: Config;
}