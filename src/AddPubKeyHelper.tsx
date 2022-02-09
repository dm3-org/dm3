import AddPubKey from './AddPubKey';
import Icon from './Icon';

function AddPubKeyHelper() {
    return (
        <>
            <div
                className={`w-100 row-space content d-flex justify-content-start`}
            >
                <div className="arrow-left h-100" />
                <div className="circle-char text-center">1</div>
                <div>Get your encryption public key</div>
            </div>
            <div className={`w-100 publish-help d-flex justify-content-start`}>
                <div className="arrow-left h-100" />
                <div className="circle-char text-center">2</div>
                <div>Optional: publish your public key as ENS text record</div>
            </div>
        </>
    );
}

export default AddPubKeyHelper;
