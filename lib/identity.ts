// Phone-only customers get a hidden auth email on this domain; it must never be shown.
export const PHONE_EMAIL_DOMAIN = "@phone.massdistributioneg.com";

export function displayEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  return email.toLowerCase().endsWith(PHONE_EMAIL_DOMAIN) ? null : email;
}

/** True when the login input should be treated as a mobile number rather than an email. */
export function looksLikePhone(value: string): boolean {
  return !value.includes("@") && value.replace(/\D/g, "").length >= 10;
}
