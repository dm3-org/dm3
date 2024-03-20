import '../../styles/common.css';

export default function ConfigProfileAlertBox() {
    return (
        <div
            data-testid="configure-profile-alert-box"
            className="m-1 pt-2 pb-2 ps-1 pe-1 profile-configuration-box
            profile-configuration-box-border border-radius-8"
        >
            <div
                data-testid="alert-heading"
                className="row m-0 d-flex justify-content-center font-weight-800"
            >
                This contact hasn’t published the dm3 profile yet.
            </div>
            <div
                data-testid="alert-description"
                className="row m-0 d-flex justify-content-center"
            >
                You can already write messages. But these will not be sent until
                the recipient has published the dm3 profile. Until then they are
                saved in your storage.
            </div>
        </div>
    );
}
