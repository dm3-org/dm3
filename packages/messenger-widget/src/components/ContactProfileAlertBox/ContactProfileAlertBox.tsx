import '../../styles/common.css';

export default function ConfigProfileAlertBox() {
    return (
        <div
            className="pt-2 pb-2 ps-1 pe-1 font-size-14 text-primary-color 
            background-config-box background-config-box-border border-radius-8"
        >
            <div className="row m-0 d-flex justify-content-center font-weight-800">
                This contact hasn’t published the dm3 profile yet.
            </div>
            <div className="row m-0 d-flex justify-content-center">
                You can already write messages. But these will not be sent until
                the recipient has published the dm3 profile. Until then they are
                saved in your storage.
            </div>
        </div>
    );
}
