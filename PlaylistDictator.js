import { Login } from "./Login"
import { MainPD } from "./MainPD";


export default function PlaylistDictator() {

    let code = new URLSearchParams(window.location.search).get("code")     
    //console.log(code)
    return (
      <>
          { (code === null) ? <Login/> : <MainPD code={code} /> }
      </>
    );
  }