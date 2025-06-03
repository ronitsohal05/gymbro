import { useState, useEffect } from "react";
import { ping } from "./services/api";

function App() {
  const [text, setText] = useState('Ping did not Pong');


  useEffect(() => {
    ping()
      .then((res) => {
        if (res.data.pong) {
          setText('Ping did in fact Pong')
        }
      })
      .catch((err) => console.error(err));
  }, [])


  return (
    <>
      <h1 className="">{text}</h1>
    </>
  )
}

export default App
