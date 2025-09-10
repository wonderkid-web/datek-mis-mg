import { getCurrentSession } from "@/lib/session"

async function page() {
  const session = await getCurrentSession()
  return (
    <div>
      <h1>INI DASHBOARD LUR..</h1>
      <pre>
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  )
}

export default page