//import { accessUrl, getToken } from "./spotify"
//'streaming
//%20user-read-email
//%20user-read-private
//%20user-library-read
//%20user-library-modify
//%20user-read-playback-state
//%20user-modify-playback-state'
const AuthURL = 'https://accounts.spotify.com/authorize?response_type=code&client_id=d2fcfa34e3244803a57637f0a9505179&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state&redirect_uri=http://localhost:3000/PlaylistDictator'
//const AuthURL = "https://accounts.spotify.com/authorize?client_id=d2fcfa34e3244803a57637f0a9505179&response_type=code&redirect_uri=http://localhost:3000/PlaylistDictator&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state&show_dialog=true"


export function Login(){
    //let token = getToken()
    //console.log(token)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <a className="btn btn-success btn-lg" href={AuthURL}>
          Login With Spotify
        </a>
      </div>
    )
  }


