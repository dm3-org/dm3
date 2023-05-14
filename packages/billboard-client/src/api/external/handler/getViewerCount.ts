import { IViewerService } from '../../../service/viewerService/IViewerService';

export function getViewerCountHandler(
    viewerService: IViewerService,
): IRpcCallHandler {
    return {
        method: 'dm3_billboard_countActiveViewers',
        handle: async (params: string[]) => {
            const viewerCount = viewerService.getViewerCount();
            return {
                status: 'success',
                value: { viewers: viewerCount },
            };
        },
    };
}
