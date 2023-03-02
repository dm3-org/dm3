import React, { useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ContactListEntry from './ContractListEntry';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from 'dm3-lib';

function ContactList() {
    const { state } = useContext(GlobalContext);
    const contactsList = state.accounts.contacts
        ? state.accounts.contacts
              .filter(
                  (contact) =>
                      !state.userDb?.hiddenContacts.find(
                          (hiddenContact) =>
                              Lib.account.normalizeEnsName(hiddenContact) ===
                              Lib.account.normalizeEnsName(
                                  contact.account.ensName,
                              ),
                      ),
              )
              .map((contact) => (
                  <ContactListEntry
                      key={contact.account.ensName}
                      connection={state.connection}
                      contact={contact}
                  />
              ))
        : [];

    return <div className="list-group">{contactsList}</div>;
}

export default ContactList;
