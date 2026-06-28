import { supabase } from "./supabase";

export interface SignUpData {
  email: string;
  password: string;
  businessName: string;
  contactName: string;
  phone: string;
  area: string;
  customerType: string;
}

export async function signUp(data: SignUpData) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });
  if (authError) return { user: null, needsConfirmation: false, error: authError.message };
  if (!authData.user) return { user: null, needsConfirmation: false, error: "Registration failed." };

  // Insert customer profile using auth user ID as primary key
  const { error: custError } = await supabase.from("customers").insert({
    id:            authData.user.id,
    name:          data.contactName,
    business_name: data.businessName,
    phone:         data.phone,
    email:         data.email,
    address:       data.area,
  });
  if (custError) console.error("Customer profile error:", custError.message);

  // If no session yet, email confirmation is required
  const needsConfirmation = !authData.session;
  return { user: authData.user, needsConfirmation, error: null };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user, session: data.session, error: error?.message ?? null };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
