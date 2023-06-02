import { IExecWeb3Mail } from '@iexec/web3mail';
import { getAccount } from '@wagmi/core';

//fetch my contacts by calling fetchMyContacts method from @iexec/web3mail
export const fetchMyContacts = async () => {
  const result = getAccount();
  const provider = await result.connector?.getProvider();
  const web3mail = new IExecWeb3Mail(provider);
    const contacts = await web3mail.fetchMyContacts();
  return contacts;
};