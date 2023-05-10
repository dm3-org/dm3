export interface IDsConnectorService {
    getConnectedBillboards: () => string[];
    disconnect: () => void;
}
