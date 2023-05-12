export interface IDsManagerService {
    getConnectedBillboards: () => string[];
    disconnect: () => void;
}
