import { useEffect, useState } from "react"
import { SpotifyApi } from "./MainPD";


export function Player({token, playlistOrder}){

    const [deviceID, setDeviceID] = useState('');
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState('');
    const [session, setSession] = useState(false);
    const [nextSong, setNextSong] = useState(null);
    const [previousSong, setPreviousSong] = useState(false);

    //Crear Player
    useEffect(() => {

        SpotifyApi.setAccessToken(token);
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
    
        document.body.appendChild(script);
    
        window.onSpotifyWebPlaybackSDKReady = () => {
    
            const player = new window.Spotify.Player({
                name: 'PD Player',
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });
    
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setDeviceID(device_id)
                player.removeListener('ready')
            });
    
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });    
    
            player.connect();

            player.addListener('player_state_changed', ( state => {

                if (!state) {
                    return;
                }
            
                setTrack(state.track_window.current_track);
                setPaused(state.paused);
            
            
                player.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });
            
            }));
    
        };
    }, [token]);

    useEffect(()=>{

        SpotifyApi.transferMyPlayback([deviceID])
        .then(()=> {
        console.log('Transfering playback to ' + deviceID);
        }, (err)=> {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        console.log('Something went wrong!', err);                       
        });

    },[deviceID])

    useEffect(()=>{
        playlistOrder.forEach((el,i)=>{
            el === current_track.uri && setNextSong(playlistOrder[i+1])
        })
        playlistOrder.forEach((el,i)=>{
            el === current_track.uri && setPreviousSong(playlistOrder[i-1])
        })

    },[playlistOrder, current_track])

    function play(){
        
        if(!session){
        SpotifyApi.play({uris: [playlistOrder[0]]})
        .then(function() {
            console.log('Playback started');
        }, function(err) {
            //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
            console.log('Something went wrong!', err);
        })
        .then(() => setSession(true));
        }else{
        SpotifyApi.play()
        .then(function() {
            console.log('Playback started');
        }, function(err) {
            //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
            console.log('Something went wrong!', err);
        })};      
    }

    function pause(){
        SpotifyApi.pause()
        .then(function() {
            console.log('Playback paused');
        }, function(err) {
            //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
            console.log('Something went wrong!', err);
        });
    }

    function next(){

        if(nextSong){
            SpotifyApi.play({uris: [nextSong]})
            .then(function() {
            console.log('Playback started');
            }, function(err) {
            //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
            console.log('Something went wrong!', err);
            })
        }else{
            SpotifyApi.play({uris: [playlistOrder[0]]})
            .then(function() {
            console.log('Playback started');
            }, function(err) {
            //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
            console.log('Something went wrong!', err);
            })            
        };

        // SpotifyApi.skipToNext()
        // .then(function() {
        // console.log('Skip to next');
        // }, function(err) {
        // //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        // console.log('Something went wrong!', err);
        // });
    }

    function previous(){

        if(previousSong){
            SpotifyApi.play({uris: [previousSong]})
            .then(function() {
            console.log('Playback started');
            }, function(err) {
            //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
            console.log('Something went wrong!', err);
            })};
        // SpotifyApi.skipToPrevious()
        // .then(function() {
        // console.log('Skip to previous');
        // }, function(err) {
        // //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        // console.log('Something went wrong!', err);
        // });
    }

    useEffect(()=>{

        SpotifyApi.getMyCurrentPlayingTrack()
        .then(function(data) {
        console.log('Now playing: ',data.body);
        if(data.body && data.body.progress_ms === data.body.item.duration_ms){
            console.log('se acabo la rola')
            if(!nextSong){
                SpotifyApi.play({uris: [playlistOrder[0]]})
                .then(function() {
                console.log('Playback started');
                }, function(err) {
                //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
                console.log('Something went wrong!', err);
                }) 
            }else next()
        }
        }, function(err) {
        console.log('Something went wrong!', err);
        });

    })
    
    useEffect(()=>{
        if(!token){
            console.log('token no esta listo')
        }
        else console.log('token: ', token)  
    }, [token])

    useEffect(()=>{
        if(playlistOrder.length > 0){
            console.log('playlist: ',playlistOrder)
        }
    }, [playlistOrder])

    
    console.log('current track: ',current_track)
    console.log('is active: ',is_active)
    console.log('session iniciada: ', session)
    console.log('siguiente: ', nextSong)


    return (
        <>
            <div className="container col-3" style={{width: "auto" }} >
                {is_active && <>
                <div className="main-wrapper d-flex flex-row align-items-center my-1">
                {session && 
                    <>
                    <img src={current_track.album.images[0].url} 
                         className="now-playing__cover m-1" alt="popo" style={{ height: "80px", width: "80px" }}/>    
                    <div className="now-playing__side">
                        <div className="now-playing__name  text-truncate">{
                                      current_track.name
                                      }</div>    
                        <div className="now-playing__artist  text-truncate">{
                                      current_track.artists[0].name
                                      }</div>
                    </div></>}
                </div>
                <button className="btn-spotify" onClick={previous} ><i class="bi bi-skip-backward-fill"></i></button>
                
                { is_paused ? <button className="btn-spotify" onClick={play} ><i class="bi bi-play-fill"></i></button> 
                            : <button className="btn-spotify" onClick={pause} ><i class="bi bi-pause-fill"></i></button> }

                <button className="btn-spotify" onClick={next} ><i class="bi bi-skip-forward-fill"></i></button></>}
            </div>
         </>
    )
}

