import { useEffect } from "react";
import detailsIcon from "../../assets/images/details.svg";
import hideIcon from "../../assets/images/hide.svg";
import { ContactMenu } from "../../interfaces/props";

export function ContactMenu(props: ContactMenu) {

  const onClickOfShowDetails = () => {
    props.closeContactMenu();
  }

  const onClickOfHideContact = () => {
    props.closeContactMenu();
  }

  function getPositionAtCenter(element: HTMLElement) {
    const { top, left, width, height } = element.getBoundingClientRect();
    console.log("top, left, width, height : ", top, left, width, height);
    return {
      x: left + width / 2,
      y: top + height / 2
    };
  }

  const getPositionDetails = () => {
    const details = document.getElementsByClassName("action-dot")[0] as HTMLElement;
    const drop = document.getElementsByClassName("dropdown-content")[0] as HTMLElement;
    if (details && drop) {
      const aPosition = getPositionAtCenter(details);
      const bPosition = getPositionAtCenter(drop);

      const pos = Math.hypot(aPosition.x - bPosition.x, aPosition.y - bPosition.y);
      console.log("position lft: ", pos);
    }
  }


  useEffect(() => {
    getPositionDetails();
  }, [])

  return (

    <div className="dropdown-content d-flex font-size-14 font-weight-400">
      <div
        className='d-flex align-items-center justify-content-start'
        onClick={() => onClickOfShowDetails()}
      >
        <img src={detailsIcon} alt='details' className="me-2" />
        Show Details
      </div>
      <div
        className='d-flex align-items-center justify-content-start'
        onClick={() => onClickOfHideContact()}
      >
        <img src={hideIcon} alt='hide' className="me-2" />
        Hide Contact
      </div>
    </div>

  );

}