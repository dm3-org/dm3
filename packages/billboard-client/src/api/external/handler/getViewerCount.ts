export function getViewerCountHandler(
    viewerService: IViewerService,
): IRpcCallHandler {
    return {
        method: 'dm3_billboard_countActiveViewers',
        handle: (params: string[]) => {
            const viewerCount = viewerService.getViewerCount();
            return Promise.resolve({
                status: 'success',
                value: viewerService,
            });
        },
    };
}
