import './AddConversation.css';
import '../../styles/modal.css';
import closeIcon from '../../assets/images/cross.svg';
import { closeConversationModal } from './bl';

export default function AddConversation() {
    const submit = () => {};

    return (
        <div>
            <div
                id="conversation-modal"
                className="modal-container display-none position-fixed w-100 h-100 pointer-cursor"
            >
                <div
                    className="conversation-modal-content border-radius-6 
                background-container text-primary-color"
                >
                    <div className="d-flex align-items-start">
                        <div>
                            <h4 className="font-weight-800">
                                Add Conversation
                            </h4>
                            <div className="font-weight-500 font-size-12">
                                Add or reactivate a conversation with a web3
                                name.
                            </div>
                        </div>
                        <img
                            className="conversation-close-icon"
                            src={closeIcon}
                            alt="close"
                            onClick={closeConversationModal}
                        />
                    </div>
                    <hr className="line-separator text-secondary-color" />
                    <form onSubmit={submit}>
                        <div className="">
                            <label htmlFor="name"> Name</label>
                            <input
                                className="conversation-name"
                                type="text"
                                placeholder="Enter the name or address of the contact"
                            />
                            <button className="add-btn">Add</button>
                        </div>
                    </form>

                    <p className="conversation-description">
                        Enter the web3 name or the address (the reverse lookup
                        should be configured) of the contact you want to start a
                        conversation. If the recipient has not yet published
                        his/her dm3 profile, messages will be stored and sent
                        later.
                    </p>
                </div>
            </div>
        </div>
    );
}
