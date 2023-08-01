import "./RightView.css";
import { useContext } from "react";
import { Profile } from "../Profile/Profile";
import { logo } from "../../assets/base64/logo";
import { RightHeader } from "../RightHeader/RightHeader";
import { GlobalContext } from "../../utils/context-utils";

export default function RightView() {

  // fetches context storage
  const { state } = useContext(GlobalContext);

  return (

    <div className="h-100">
      <div className="row w-100 h-auto right-view-outer-container">
        {state.rightView.showHeader && <RightHeader />}
        <div className="col-12 p-0 h-auto border-radius-8 background-chat chat-screen-container">
          {state.rightView.showDefaultChat &&
            <div className="d-flex justify-content-center align-items-center h-100">
              <img className="img-fluid" src={logo} alt="logo" />
            </div>
          }
          {state.rightView.showProfile && <Profile />}
        </div>
      </div>
    </div>

  );

}