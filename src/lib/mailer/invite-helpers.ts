import * as dhive from '@hiveio/dhive';
import serverMailer from './route';

export const client = new dhive.Client([
    "https://api.deathwing.me",
    "https://hive-api.arcange.eu",
    "https://api.hive.blog",
  ]);

export const generatePassword = () => {
    const array = new Uint32Array(10);
    crypto.getRandomValues(array);

    const key = 'SKATE000' + dhive.PrivateKey.fromSeed(array.toString()).toString();
    return key.substring(0, 25);
}

export const getPrivateKeys = (username: string, password: string, roles = ['owner', 'active', 'posting', 'memo']) => {
    const privKeys = {} as any;
    roles.forEach((role) => {
        privKeys[role] = dhive.PrivateKey.fromLogin(username, password, role as dhive.KeyRole).toString();
        privKeys[`${role}Pubkey`] = dhive.PrivateKey.from(privKeys[role]).createPublic().toString();
    });

    return privKeys;
};

// @ts-ignore
export function validateAccountName(value) {
    var i = void 0, label = void 0, len = void 0, suffix = void 0;
    // @ts-expect-error
    suffix = "Account name should ";
    if (!value) {
      return suffix + "not be empty.";
    }
    var length = value.length;
    if (length < 3) {
      return suffix + "be longer.";
    }
    if (length > 16) {
      return suffix + "be shorter.";
    }
    if (/\./.test(value)) {
      // @ts-expect-error
      suffix = "Each account segment should ";
    }
    var ref = value.split(".");
    // @ts-expect-error
    for (i = 0, len = ref.length; i < len; i++) {
    // @ts-expect-error
      label = ref[i];// @ts-expect-error
      if (!/^[a-z]/.test(label)) {
        return suffix + "start with a lowercase letter.";
      }// @ts-expect-error
      if (!/^[a-z0-9-]*$/.test(label)) {
        return suffix + "have only lowercase letters, digits, or dashes.";
      }
      // Multiple dashes in a row is VALID
      // if (/--/.test(label)) {
      //   return suffix + "have only one dash in a row.";
      // }
      // @ts-expect-error
      if (!/[a-z0-9]$/.test(label)) {
        return suffix + "end with a lowercase letter or digit.";
      // @ts-expect-error
      if (!(label.length >= 3)) {
        return suffix + "be longer";
      }
    }
    return null;
  }
}

export const checkAccountExists = async (desiredUsername: string) => {
    try {
        const accounts = await client.database.getAccounts([desiredUsername]);
        return accounts.length === 0;
    } catch (error) {
        console.error('Error checking account:', error);
        return false;
    }
};

export const copyToClipboard = (text: string) => {
  //deprecated
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};


export async function sendInviteEmail(desiredEmail: string, desiredUsername: string, 
                                createdby:string, masterPassword:string, keys:any) {
  console.log("Send Invite Email");
  console.log(desiredEmail);
  console.log(desiredUsername);
  await serverMailer(desiredEmail, 
                    'Welcome to Skatehive @'+desiredUsername,
                    createdby,
                    desiredUsername,
                    masterPassword,
                    keys).then((data)=>{
        if (data == true)
          console.log('Thanks for onboarding using Skatehive');
        else 
          console.log('Try Again! Call Skatehive Devs');
      }
    );
}

export async function sendTestEmail(desiredEmail: string, desiredUsername: string, 
  createdby:string, masterPassword:string, keys:any) {
  await serverMailer(
     'test@gmail.com',
    'Welcome to Skatehive @'+desiredUsername + " TEST "+ desiredEmail,
    createdby,
    desiredUsername,
    masterPassword,
    keys).then((data)=>{
        if (data == true)
          console.log('Thanks for onboarding using Skatehive');
        else 
          console.log('Try Again! Call Skatehive Devs');
      }
    );
}