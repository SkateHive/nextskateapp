import { getLocalizedStrings } from "./localization";

export default function getMailTemplate_Invite(
  createdby: string,
  desiredUsername: string,
  masterPassword: string,
  keys: any,
  language: string // Add language parameter
) {
  const localizedStrings = getLocalizedStrings(language); // Load localized strings
  const MAIL_COMMUNITY_LOGO = 'https://skatehive.app/public/images/skatehive-logo.png';

  const INVITE_MAIL_TEMPLATE = `
<div style="background-color:${localizedStrings.colors.background1}; color:${localizedStrings.colors.foreground2};margin:0;padding:0;">
  <div style="max-width:600px;margin:30px auto;border-radius:8px;box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); padding: 20px;">
    <div style="background-color:${localizedStrings.colors.background2}; padding:20px; border-radius:8px 8px 0 0; text-align:center;">
      <img src="${MAIL_COMMUNITY_LOGO}" alt="Skate Hive" style="max-width:80px; vertical-align: middle;">
      <h1 style="display: inline-block; margin: 0; font-size: 24px; color: ${localizedStrings.colors.foreground1}; vertical-align: middle;">
        ${localizedStrings.welcomeMessage} ${desiredUsername}</h1>
    </div>
    <div style="padding: 20px;">
      <h2 style="color: ${localizedStrings.colors.foreground1}; font-size: 20px; margin-top: 0;">
        ${localizedStrings.onboardedMessage.replace('{createdby}', createdby)}</h2>
        <p style="color:${localizedStrings.colors.foreground2}">${localizedStrings.keepKeysSafeMessage}</p>
      <div style="background-color: ${localizedStrings.colors.keyBackground}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <tr>
            <td style="padding: 10px; border: 1px solid ${localizedStrings.colors.foreground1}; font-size: 14px; font-weight: bold; color: ${localizedStrings.colors.foreground1};">
              ${localizedStrings.usernameLabel}:</td>
            <td style="padding: 10px; border: 1px solid ${localizedStrings.colors.foreground1}; font-size: 14px; color: #fff;">
              ${desiredUsername}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid ${localizedStrings.colors.foreground1}; font-size: 14px; font-weight: bold; color: ${localizedStrings.colors.foreground1};">
              ${localizedStrings.masterPasswordLabel}:</td>
            <td style="padding: 10px; border: 1px solid ${localizedStrings.colors.foreground1}; font-size: 14px;  color: #fff;">
              ${masterPassword}</td>
          </tr>
        </table>
      </div>
      <p style="color:${localizedStrings.colors.foreground2}">${localizedStrings.importKeysMessage}</p>
      <div style="background-color: ${localizedStrings.colors.keyBackground}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <tr>
            <td style="color: ${localizedStrings.colors.foreground1}; padding: 10px; border: 1px solid ${localizedStrings.colors.foreground1}; font-size: 14px; font-weight: bold;">
              ${localizedStrings.ownerKeyLabel}:</td>
            <td style="padding: 10px; border: 1px solid ${localizedStrings.colors.foreground1}; font-size: 14px; color: #fff;">
            ${keys.owner}</td>
          </tr>
          <tr>
            <td style="color: ${localizedStrings.colors.foreground1}; padding: 10px; border: 1px solid ${localizedStrings.colors.foreground1}; font-size: 14px; font-weight: bold;">
              ${localizedStrings.activeKeyLabel}:</td>
              <td style="padding: 10px; border: 1px solid ${localizedStrings.colors.foreground1}; font-size: 14px; color: #fff;">
              ${keys.active}</td>
          </tr>
          <tr>
            <td style="color: ${localizedStrings.colors.foreground1}; padding: 10px; border: 1px solid ${localizedStrings.colors.foreground1}; font-size: 14px; font-weight: bold;">
              ${localizedStrings.postingKeyLabel}:</td>
              <td style="padding: 10px; border: 1px solid ${localizedStrings.colors.foreground1}; font-size: 14px; color: #fff;">
              ${keys.posting}</td>
          </tr>
          <tr>
            <td style="color: ${localizedStrings.colors.foreground1}; padding: 10px; border: 1px solid ${localizedStrings.colors.foreground1}; font-size: 14px; font-weight: bold;">
              ${localizedStrings.memoKeyLabel}:</td>
              <td style="padding: 10px; border: 1px solid ${localizedStrings.colors.foreground1}; font-size: 14px; color: #fff;">
              ${keys.memo}</td>
          </tr>
        </table>
      </div>
      <div style="background-color:${localizedStrings.colors.alertBackground}; color: #fff; padding: 10px; border-radius: 8px; margin-bottom: 20px; font-size: 16px; text-align: center; font-weight: bold;">
        ${localizedStrings.importantMessage}
      </div>
      <div style="background-color:${localizedStrings.colors.highlightBackground}; color: ${localizedStrings.colors.foreground2}; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 16px;">
        <h3 style="margin-top: 0;">
          ${localizedStrings.keysDescriptionTitle}</h3>
        <p><strong>${localizedStrings.postingKeyLabel}:</strong> ${localizedStrings.postingKeyDescription}</p>
        <p><strong>${localizedStrings.activeKeyLabel}:</strong> ${localizedStrings.activeKeyDescription}</p>
        <p><strong>${localizedStrings.memoKeyLabel}:</strong> ${localizedStrings.memoKeyDescription}</p>
        <p><strong>${localizedStrings.ownerKeyLabel}:</strong> ${localizedStrings.ownerKeyDescription}</p>
      </div>
      <p style="color:${localizedStrings.colors.foreground2}">${localizedStrings.keysRulesTitle}</p>
      <div style="background-color:${localizedStrings.colors.alertBackground};color: #fff;font-size:16px;text-align:center;font-weight:bold;padding:10px;border-radius:8px;margin-bottom:20px;">
        ${localizedStrings.keysRules}
      </div>
    </div>
    <div style="background-color: ${localizedStrings.colors.background2}; color:${localizedStrings.colors.foreground2};padding:10px; border-radius: 0 0 8px 8px;text-align:center;">
      <p style="margin: 0;">${localizedStrings.footerMessage}</p>
      <h1 style="margin: 0; color:${localizedStrings.colors.foreground1}">https://skatehive.app/</h1>
    </div>
  </div>
</div>
`;

  return INVITE_MAIL_TEMPLATE;
}