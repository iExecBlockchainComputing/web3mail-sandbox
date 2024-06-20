import { IExecWeb3mail } from '@iexec/web3mail';
import { checkCurrentChain, checkIsConnected } from './utils';

export async function fetchMyContacts() {
  checkIsConnected();
  await checkCurrentChain();
  const web3mail = new IExecWeb3mail(window.ethereum);
  return web3mail.fetchMyContacts();
}

export async function sendMail(
  mailObject: string,
  mailContent: string,
  protectedData: string,
  contentType?: string,
  senderName?: string
) {
  checkIsConnected();
  await checkCurrentChain();
  const web3mail = new IExecWeb3mail(window.ethereum);
  return web3mail.sendEmail({
    emailSubject: mailObject,
    emailContent: mailContent,
    protectedData,
    contentType,
    senderName,
  });
}
