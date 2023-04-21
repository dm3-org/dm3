import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { normalizeEnsName } from 'dm3-lib-profile';
import { useContext } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import ContactListEntry from './ContractListEntry';

function ContactList() {
    const { state } = useContext(GlobalContext);
    const contactsList = state.accounts.contacts
        ? state.accounts.contacts
              .filter(
                  (contact) =>
                      !state.userDb?.hiddenContacts.find(
                          (hiddenContact) =>
                              normalizeEnsName(
                                  hiddenContact.ensName,
                              ) ===
                              normalizeEnsName(
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
