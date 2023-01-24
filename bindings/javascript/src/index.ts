import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { zencode_exec } from 'zenroom';


export const createKeyring = async (
    description: string
) :Promise<string> => {
  const contract = readFileSync(join(__dirname, 'create-keyring.zen'), 'utf-8');
  const data = `{"controller": "${description}"}`; //maybe description.replace(/ /g,"_")
  let result: string;
  try {
    ({result} = await zencode_exec(contract, {data, keys : "{}"}));
  } catch(e) {
    console.log(e);
  }
  return result;
}
const preparePks = async (
  requestKeyring: string,
  requestDomain: string,
  signerDomain: string
) :Promise<string> => {
  const contractPks = readFileSync(join(__dirname, 'create-identity-pubkeys.zen'), 'utf-8');
  const data = readFileSync(join(__dirname, 'did-settings.json'), 'utf-8');
  let result: string;
  try {
    ({result} = await zencode_exec(contractPks, {data, keys : requestKeyring}));
  } catch(e) {
    console.log(e);
  }
  result = JSON.parse(result);
  result["did_spec"] = requestDomain;
  result["signer_did_spec"] = signerDomain;
  result["timestamp"] = new Date().getTime().toString();
  return JSON.stringify(result);
}

export const createRequest = async (
  requestKeyring: string,
  requestDomain: string,
  signerKeyring: string,
  signerDomain: string
) :Promise<string> => {
  const contractRequest = readFileSync(join(__dirname, 'pubkeys-request-signed.zen'), 'utf-8');
  const data = await preparePks(requestKeyring, requestDomain, signerDomain);
  let result: string;
  try {
    ({result} = await zencode_exec(contractRequest, {data, keys : signerKeyring}));
  } catch(e) {
    console.log(e);
  }
  return result;
}

export const deactivateRequest = async (
  requestKeyring: string,
  requestDomain: string,
  signerKeyring: string,
  signerDomain: string
) :Promise<string> => {
  const contractRequest = readFileSync(join(__dirname, 'pubkeys-deactivate.zen'), 'utf-8');
  const data = await preparePks(requestKeyring, requestDomain, signerDomain);
  let result: string;
  try {
    ({result} = await zencode_exec(contractRequest, {data, keys : signerKeyring}));
  } catch(e) {
    console.log(e);
  }
  return result;
}

export const sendRequest = async (
  endpoint: string,
  request: string
) :Promise<string> => {
  const res = await axios.post(
    `https://did.dyne.org:443/${endpoint}`,
    { data: JSON.parse(request), keys: "{}"}
    )
    .then((response) => response.data)
    .catch((err) => console.log(err));
  return res;
}