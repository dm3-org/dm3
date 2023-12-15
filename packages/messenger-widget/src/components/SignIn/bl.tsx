import loader from '../../assets/images/loader.svg';
import { ButtonState } from '../../utils/enum-type-utils';

// fetches icon to show on Sign IN button as a loader
export const getIcon = (btnState: ButtonState) => {
    switch (btnState) {
        case ButtonState.Failed:
            return null;
        case ButtonState.Loading:
            return <img className="rotating" src={loader} alt="loader" />;
        case ButtonState.Success:
            return <img className="rotating" src={loader} alt="loader" />;
        case ButtonState.Ideal:
        case ButtonState.Disabled:
        default:
            return null;
    }
};

// Updates the button style
export function changeSignInButtonStyle(
    id: string,
    classOne: string,
    classTwo: string,
) {
    const element = document.getElementById(id) as HTMLElement;
    element.classList.remove(classOne);
    element.classList.add(classTwo);
}
