import React from 'react'
import { Modal } from 'mdbreact'

const ModalForm = props => (
  <Modal isOpen={props.isActive} toggle={props.closeModal}>
    <div className="card-body flex-space">
      <h3>{props.title}</h3>
      <button
        type="button"
        className="close"
        aria-label="Close"
        onClick={props.closeModal}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
    {props.children}
  </Modal>
)

export default ModalForm
