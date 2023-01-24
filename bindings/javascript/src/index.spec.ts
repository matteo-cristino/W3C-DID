import test from 'ava';
import * as dotenv from "dotenv";
import { createKeyring, createRequest,
  deactivateRequest, sendRequest
} from './index';
dotenv.config();

let acceptRequest: string = null;
let sandboxTestKeyring: string = null;

test.serial("Create a keyring", async (t) => {
  sandboxTestKeyring = await createKeyring("sandbox_test_from_js");
  t.is(typeof sandboxTestKeyring, "string");
  const r = JSON.parse(sandboxTestKeyring);
  t.is(typeof r['sandbox_test_from_js'], "object");
  t.is(r["controller"], "sandbox_test_from_js")
  t.is(typeof r['sandbox_test_from_js']["keyring"]["ecdh"], "string");
  t.is(typeof r['sandbox_test_from_js']["keyring"]["eddsa"], "string");
  t.is(typeof r['sandbox_test_from_js']["keyring"]["ethereum"], "string");
  t.is(typeof r['sandbox_test_from_js']["keyring"]["bitcoin"], "string");
  t.is(typeof r['sandbox_test_from_js']["keyring"]["reflow"], "string");
})

test.serial("Create a request", async (t) => {
  const sandboxTestAKeyring = process.env.TEST_ADMIN_KEYRING;
  acceptRequest = await createRequest(
    sandboxTestKeyring, "sandbox.test",
    sandboxTestAKeyring, "sandbox.test_A");
  t.is(typeof acceptRequest, "string");
  const r = JSON.parse(acceptRequest);
  t.is(typeof r["did_document"]["@context"], "object");
  t.is(typeof r["did_document"]["id"], "string");
  t.is(typeof r["did_document"]["verificationMethod"], "object");
  t.is(r["did_document"]["description"], "sandbox_test_from_js");
  t.is(typeof r["ecdh_signature"], "object");
  t.is(typeof r["eddsa_signature"], "string");
  t.is(typeof r["timestamp"], "string");
  t.is(typeof r["id"], "string");
})

test.serial("Send a request", async (t) => {
  const result = await sendRequest(
    "api/v1/sandbox/pubkeys-accept.chain",
    acceptRequest
    );
  t.is(typeof result, "object");
  t.is(typeof result["result"], "object");
  t.is(typeof result["result"]["@context"], "string");
  t.is(typeof result["result"]["didDocument"], "object");
  t.is(typeof result["result"]["didDocumentMetadata"], "object");
})