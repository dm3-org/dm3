import "./RightHeader.css";
import { useContext, useEffect, useState } from "react";
import profPic from "../../assets/images/profile-pic.jpg";
import { GlobalContext } from "../../utils/context-utils";
import { getAvatarProfilePic } from "../../utils/ens-utils";
import { RightViewStateType } from "../../utils/enum-type-utils";

export function RightHeader() {

  // fetches context storage
  const { state, dispatch } = useContext(GlobalContext);

  // state to store profile pic of signed in user
  const [profilePic, setProfilePic] = useState<string>("");

  // method to fetch profile pic 
  const fetchAndSetProfilePic = async () => {
    setProfilePic(await getAvatarProfilePic(state, state.connection.account?.ensName as string));
  }

  // method to open or close profile page
  const updateView = () => {
    const profileActive: boolean = state.rightView.showProfile;
    dispatch({
      type: RightViewStateType.ShowProfile,
      payload: !profileActive
    });
    dispatch({
      type: RightViewStateType.ShowDefaultChat,
      payload: !profileActive ? false : true
    });
  }

  // loads the profile pic on page render
  useEffect(() => {
    fetchAndSetProfilePic();
  }, []);

  return (
    <div className={"col-12 d-flex align-items-end justify-content-end pr-0 profile-name-container" + (state.rightView.showProfile ? " background-chat" : "")}>
      <span onClick={() => updateView()}
        className="profile-name font-weight-500 pointer-cursor text-secondary-color">
        {state.connection.account?.ensName}
      </span>
      <img src={profilePic ? profilePic : profPic}
        alt="menu"
        className="pointer-cursor border-radius-3 default-profile-pic"
        onClick={() => updateView()}
      />
    </div>
  );

}