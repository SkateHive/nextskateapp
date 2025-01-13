//invite-template
export default function getMailTemplate_Invite(
  createdby: string,
  desiredUsername: string,
  masterPassword: string,
  keys: any) {

  let footer = `Account created on ${new Date().toUTCString()}\n`;
  footer += ` by ${createdby}\n`;
  footer += ` at SKATEHIVE!`;

  const MAIL_COMMUNITY_LOGO = 'https://skatehive.app/public/images/skatehive-logo.png';
  const MAIL_BACKGROUND_COLOR1 = '#1e1e1e'; //dark gray      bring it from theme!
  const MAIL_BACKGROUND_COLOR2 = '#333';    //light gray

  const MAIL_FOREGROUND_COLOR1 = '#4caf50'; //green
  const MAIL_FOREGROUND_COLOR2 = '#e0e0e0'; //light

  const MAIL_BACKGROUND_HIGH = '#2e7d32'; //other green
  const MAIL_BACKGROUND_ALERT = '#d32f2f'; //red

  const INVITE_MAIL_TEMPLATE = `
<div style="background-color:${MAIL_BACKGROUND_COLOR1}; color:${MAIL_FOREGROUND_COLOR2};margin:0;padding:0;">
  <div style="max-width:600px;margin:30px auto;border-radius:8px;box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); padding: 20px;">
    <div style="background-color:${MAIL_BACKGROUND_COLOR2}; padding:20px; border-radius:8px 8px 0 0; text-align:center;">
      <img src="${MAIL_COMMUNITY_LOGO}" alt="Skate Hive" style="max-width:80px; vertical-align: middle;">
      <h1 style="display: inline-block; margin: 0; font-size: 24px; color: ${MAIL_FOREGROUND_COLOR1}; vertical-align: middle;">
        Welcome to Skate Hive ${desiredUsername}</h1>
    </div>
    <div style="padding: 20px;">
      <h2 style="color: ${MAIL_FOREGROUND_COLOR1}; font-size: 20px; margin-top: 0;">
        Hey skater, @${createdby} onboarded you into Skate Hive Community.</h2>
        <p style="color:${MAIL_FOREGROUND_COLOR2}">Here is your user details and keys. Remember to not share your keys and always Keep them safe!</p>
      <div style="background-color: #2c2c2c; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <tr>
            <td style="padding: 10px; border: 1px solid ${MAIL_FOREGROUND_COLOR1}; font-size: 14px; font-weight: bold; color: ${MAIL_FOREGROUND_COLOR1};">
              Username:</td>
            <td style="padding: 10px; border: 1px solid ${MAIL_FOREGROUND_COLOR1}; font-size: 14px; color: #fff;">
              ${desiredUsername}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid ${MAIL_FOREGROUND_COLOR1}; font-size: 14px; font-weight: bold; color: ${MAIL_FOREGROUND_COLOR1};">
              Master Password:</td>
            <td style="padding: 10px; border: 1px solid ${MAIL_FOREGROUND_COLOR1}; font-size: 14px;  color: #fff;">
              ${masterPassword}</td>
          </tr>
        </table>

      </div>

      <p style="color:${MAIL_FOREGROUND_COLOR2}>When you login using the <b>Master Password</b> it will import your Post, Active and Memo keys.</p>
      <div style="background-color: #2c2c2c; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <tr>
            <td style="color: ${MAIL_FOREGROUND_COLOR1}; padding: 10px; border: 1px solid ${MAIL_FOREGROUND_COLOR1}; font-size: 14px; font-weight: bold;">
              Owner Private Key:</td>
            <td style="padding: 10px; border: 1px solid ${MAIL_FOREGROUND_COLOR1}; font-size: 14px; color: #fff;">
            ${keys.owner}</td>
          </tr>
          <tr>
            <td style="color: ${MAIL_FOREGROUND_COLOR1}; padding: 10px; border: 1px solid ${MAIL_FOREGROUND_COLOR1}; font-size: 14px; font-weight: bold;">
              Active Private Key:</td>
              <td style="padding: 10px; border: 1px solid ${MAIL_FOREGROUND_COLOR1}; font-size: 14px; color: #fff;">
              ${keys.active}</td>
          </tr>
          <tr>
            <td style="color: ${MAIL_FOREGROUND_COLOR1}; padding: 10px; border: 1px solid ${MAIL_FOREGROUND_COLOR1}; font-size: 14px; font-weight: bold;">
              Posting Private Key:</td>
              <td style="padding: 10px; border: 1px solid ${MAIL_FOREGROUND_COLOR1}; font-size: 14px; color: #fff;">
              ${keys.posting}</td>
          </tr>
          <tr>
            <td style="color: ${MAIL_FOREGROUND_COLOR1}; padding: 10px; border: 1px solid ${MAIL_FOREGROUND_COLOR1}; font-size: 14px; font-weight: bold;">
              Memo Private Key:</td>
              <td style="padding: 10px; border: 1px solid ${MAIL_FOREGROUND_COLOR1}; font-size: 14px; color: #fff;">
              ${keys.memo}</td>
          </tr>
        </table>
      </div>

      <div style="background-color:${MAIL_BACKGROUND_ALERT}; color: #fff; padding: 10px; border-radius: 8px; margin-bottom: 20px; font-size: 16px; text-align: center; font-weight: bold;">
        IMPORTANT: Be very careful using your keys on any other website or application not using a keychain!
      </div>

      <div style="background-color:${MAIL_BACKGROUND_HIGH}; color: ${MAIL_FOREGROUND_COLOR2}; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 16px;">
        <h3 style="margin-top: 0;">
          KEYS DESCRIPTION</h3>
        <p><strong>Posting:</strong> Post, Comment, Vote, Reblog, Follow, Profile</p>
        <p><strong>Active:</strong> Wallet and Funds Management. Also the posting key atributes.</p>
        <p><strong>Memo:</strong> Send/View encrypted messages on transfers</p>
        <p><strong>Owner:</strong> Change Password, Change Keys, Recover Account</p>
      </div>

      <p style="color:${MAIL_FOREGROUND_COLOR2}>Keys 5 rules:</p>
      <div style="background-color:${MAIL_BACKGROUND_ALERT};color: #fff;font-size:16px;text-align:center;font-weight:bold;padding:10px;border-radius:8px;margin-bottom:20px;">
        - DO NOT LOSE YOUR KEYS<br>
        - DO NOT LOSE YOUR KEYS<br>
        - DO NOT LOSE YOUR KEYS<br>
        - DO NOT SHARE YOUR KEYS<br>
        - KEEP YOUR KEYS SAFE<br>
      </div>
    </div>

    <div style="padding:10px; border-radius: 0 0 8px 8px;text-align:center;">
      <p>
        <a href="https://www.youtube.com/watch?v=MtBMbdq4JFU">
          <img src="https://skatehive.app/public/images/how-to-log-skatehive.png" alt="How To Log In Skate Hive" style="max-width:400px; vertical-align: middle;"></a>
      </p>
    </div>

    <div style="background-color: ${MAIL_BACKGROUND_COLOR2}; color:${MAIL_FOREGROUND_COLOR2};padding:10px; border-radius: 0 0 8px 8px;text-align:center;">
      <p style="margin: 0;">We recommends using the Hive Keychain on ALL Hive sites and applications.</p>
      <p style="margin: 0;"></p>
      <p style="display: inline-block; padding: 10px 20px; background-color:${MAIL_BACKGROUND_COLOR1}; color:${MAIL_FOREGROUND_COLOR2}; text-align: center; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; text-decoration: none;">
        https://hive-keychain.com/
      </p>
      <br>
      <br>keep flipping 🛹
      <h1 style="margin: 0; color:${MAIL_FOREGROUND_COLOR1}">https://skatehive.app/</h1>
      <br>
      <br>
      <small>${footer}</small>
    </div>
  </div>
</div>
`;

  return INVITE_MAIL_TEMPLATE;
}