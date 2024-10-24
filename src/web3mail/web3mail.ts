import { IExecWeb3mail } from '@iexec/web3mail';
import { checkCurrentChain, checkIsConnected } from './utils';

export async function fetchMyContacts() {
  try {
    checkIsConnected();
  } catch (err) {
    return { contacts: null, error: 'Please install MetaMask' };
  }
  await checkCurrentChain();
  const web3mail = new IExecWeb3mail(window.ethereum);
  const contacts = await web3mail.fetchMyContacts();
  return { contacts, error: '' };
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
  const { taskId } = await web3mail.sendEmail({
    emailSubject: mailObject,
    emailContent: mailContent,
    protectedData,
    contentType,
    senderName,
    useVoucher: true,
  });
  console.log('iExec worker taskId', taskId);
  return taskId;
}
