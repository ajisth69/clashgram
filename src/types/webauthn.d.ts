interface AuthenticationResponseJSON {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
  authenticatorAttachment?: string;
  clientExtensionResults: any;
  type: 'public-key';
}

interface RegistrationResponseJSON {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    authenticatorData?: string;
    transports?: string[];
    publicKeyAlgorithm?: number;
    publicKey?: string;
  };
  authenticatorAttachment?: string;
  clientExtensionResults: any;
  type: 'public-key';
}
