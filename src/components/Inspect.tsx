import React from 'react'

function Inspect({element}:{element: any}) {
  return (
    <pre>
        {JSON.stringify(element, null, 2)}
    </pre>
  )
}

export default Inspect