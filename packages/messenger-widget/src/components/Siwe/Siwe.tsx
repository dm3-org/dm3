import './Siwe.css';
import { signInImage } from '../../assets/base64/home-image';

export function Siwe({
    backgroundImage,
}: {
    backgroundImage: string | undefined;
}) {
    return (
        <div className="h-100">
            <div className="row m-0 p-0 h-100">
                <div
                    style={{
                        backgroundImage: `url(${
                            backgroundImage ?? signInImage
                        })`,
                    }}
                    className="col-12 p-0 h-100 siwe-image-container background-container"
                ></div>
            </div>
        </div>
    );
}
