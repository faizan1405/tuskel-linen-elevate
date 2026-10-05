import { redirect } from "next/navigation";

export default function AddressesRedirectPage() {
  redirect("/account/addresses");
}
