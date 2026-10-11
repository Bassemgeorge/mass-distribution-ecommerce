// Phone-only customers get a hidden auth email on this domain; it must never be shown.
export const PHONE_EMAIL_DOMAIN = "@phone.massdistributioneg.com";

export function displayEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  return email.toLowerCase().endsWith(PHONE_EMAIL_DOMAIN) ? null : email;
}

/** Human label for an auth account: the mobile number (e.g. "0122 466 8866") for hidden phone emails, else the email. */
export function accountLabel(email: string | null | undefined): string {
  if (!email) return "";
  if (displayEmail(email)) return email;
  let digits = email.split("@")[0].replace(/\D/g, "");
  if (digits.startsWith("20")) digits = `0${digits.slice(2)}`;
  return digits.length === 11 ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}` : digits;
}

/** True when the login input should be treated as a mobile number rather than an email. */
export function looksLikePhone(value: string): boolean {
  return !value.includes("@") && value.replace(/\D/g, "").length >= 10;
}
