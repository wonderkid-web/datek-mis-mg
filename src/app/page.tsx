import { redirect } from "next/navigation"


async function page() {
  return redirect("/dashboard")
}

export default page