import './Network.css';
import { Heading } from '../Heading/Heading';
import deleteIcon from '../../../assets/images/delete.svg';
import { useContext, useEffect } from 'react';
import { DM3UserProfileContext } from '../../../context/DM3UserProfileContext';
import { ModalContext } from '../../../context/ModalContext';
import { preferencesItems } from '../bl';

export function Network() {
    const heading = 'Network';
    const description = 'Define how you will be connected with the dm3 network';

    const {
        error,
        nodes,
        deleteNode,
        isModalOpenToAddNode,
        setIsModalOpenToAddNode,
        nodeName,
        addNode,
        handleNodeNameChange,
        isProfileUpdated,
    } = useContext(DM3UserProfileContext);

    const { setPreferencesOptionSelected } = useContext(ModalContext);

    // input field modal should remain close on initial load of network screen
    useEffect(() => {
        setIsModalOpenToAddNode(false);
    }, []);

    return (
        <div>
            <Heading heading={heading} description={description} />
            <div className="network">
                <div className="network-text pb-2">
                    Connected to delivery service nodes:
                </div>

                <div className="row">
                    <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12">
                        {nodes.dsNames.map((data, index) => {
                            return (
                                <div
                                    className="mt-2 ps-4 network-text d-flex"
                                    key={index}
                                >
                                    <div className="node-name">
                                        <span>{index + 1}. </span>
                                        <span>{data} </span>
                                    </div>
                                    <div>
                                        {/* Delete node option is shown only when more than 1 nodes exists */}
                                        {nodes.dsNames.length > 1 && (
                                            <img
                                                className="ms-3 pointer-cursor"
                                                src={deleteIcon}
                                                alt="remove"
                                                onClick={() => {
                                                    deleteNode(index);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {!isProfileUpdated() && (
                        <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12">
                            <span className="update-profile-box">
                                <div>
                                    {' '}
                                    Your profile configuration needs to be
                                    updated!{' '}
                                </div>
                                <u
                                    className="pointer-cursor"
                                    onClick={() =>
                                        setPreferencesOptionSelected(
                                            preferencesItems[1],
                                        )
                                    }
                                >
                                    Update your profiles now!
                                </u>
                            </span>
                        </div>
                    )}
                </div>

                {/* Button to add new Node */}
                <div className="ms-4 mt-4">
                    <button
                        className={'node-btn'.concat(
                            ' ',
                            !isModalOpenToAddNode
                                ? 'add-node-btn-active'
                                : 'add-node-btn-disabled',
                        )}
                        disabled={isModalOpenToAddNode}
                        onClick={() => {
                            setIsModalOpenToAddNode(true);
                        }}
                    >
                        Add Node
                    </button>
                </div>

                {/* Modal to add new NODE */}
                {isModalOpenToAddNode && (
                    <div className="add-node-name-container mt-5">
                        <div className="dm3-prof-select-type">
                            Add dm3 delivery service node
                        </div>

                        <div className="node-name-inner-container d-flex">
                            <p
                                className="m-0 
                    font-size-14 font-weight-500 line-height-24 title-content"
                            >
                                DM3 delivery service node’s name:
                            </p>
                            <form
                                className="d-flex width-fill align-items-center node-name-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    addNode();
                                }}
                            >
                                <input
                                    className={'node-name-input-field'.concat(
                                        ' ',
                                        error ? 'err-background' : '',
                                    )}
                                    type="text"
                                    value={nodeName}
                                    placeholder="Enter the ENS name of the node"
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => handleNodeNameChange(e)}
                                />
                            </form>
                        </div>

                        {/* Validation error */}
                        <div
                            className={
                                'add-name-error ms-0 mb-2 font-weight-400'
                            }
                        >
                            {error ?? ''}
                        </div>

                        {/* Button to submit node name */}
                        <div className="d-flex justify-content-end add-name-btn-container">
                            <button
                                className={'node-btn'.concat(
                                    ' ',
                                    'add-node-btn-active',
                                )}
                                onClick={() => addNode()}
                            >
                                Add node
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
