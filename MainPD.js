import { useEffect, useState } from "react"
import SpotifyWebApi from "spotify-web-api-node"
import { Player } from "./Player"
import axios from "axios"

const ClientID = process.env.REACT_APP_CLIENT_ID
const ClientSecret = process.env.REACT_APP_CLIENT_SECRET
export const SpotifyApi = new SpotifyWebApi({ clientId: ClientID })


export function MainPD({code}){

    const [token, setToken] = useState('');
    const [input, setInput] = useState('')
    const [inputRes, setInputRes] = useState([])
    const [canciones, setCanciones] = useState([])
    const [playlistOrder, setPlaylistOrder] = useState([])
    const container = document.getElementById('fila')  

    
    //Obtener token
    useEffect(()=>{
        let authParams = {
            method: 'POST',
            data: {
             'code': code,
              'redirect_uri': "http://localhost:3000/PlaylistDictator",
              'grant_type': 'authorization_code',
            },
            headers: {
              'Authorization': 'Basic ' + btoa(ClientID+':'+ClientSecret),
              'Content-Type' : 'application/x-www-form-urlencoded'
            },
          };
    
            axios('https://accounts.spotify.com/api/token', authParams)
            .then(res => setToken(res.data.access_token))
            .then(window.history.pushState({}, null, "/PlaylistDictator"))
            .catch(err => console.error(`Error:${err.message}, ${err.code}`))
        }, [code])  
   
    //Mostrar canciones
    useEffect(() => {
        if (!input) return setInputRes([])
        if (!token) return
    
        let cancel = false
        SpotifyApi.searchTracks(input).then(res => {
          if (cancel) return
          setInputRes(            
            res.body.tracks.items.map(track => {
              const albumImage = track.album.images.reduce(
                (smallest, image) => {
                  if (image.height > smallest.height) return image
                  return smallest
                },
                track.album.images[0]
              )
    
              return {
                artist: track.artists[0].name,
                title: track.name,
                uri: track.uri,
                image: albumImage.url,
                duration: track.duration_ms
              }
            })
          )
        })
    
        return () => (cancel = true)
      }, [input, token])


    //Hacer playlist
    function addToPlaylist(el){
        //console.log(el)
        setCanciones([...canciones,el])
        setPlaylistOrder([...playlistOrder, el.uri])
        //console.log('uri post: ', el.uri)

        // fetch(`https://api.spotify.com/v1/me/player/queue?uri=${el.uri}&device_id=${deviceID}`, {
        //     headers: {
        //         Authorization: `Bearer ${token}`,
        //         //'Content-Type': 'application/json',
        //       },
        //       method: 'POST',
        // })
        // .then(res=> console.log(res.json()))
        
    }  

    function dragStSong(e){
        //console.log(e.target)     
        e.target.classList.add('dragging')
    }
    
    function dragEndSong(e){
        e.target.classList.remove('dragging')
        //console.log(e.target)
        const draggables = document.querySelectorAll('.draggable')
        const dragArr = Array.from(draggables)
        const newPlaylistOrder = []

        dragArr.forEach(element => {
            // let strToArr = element.id.split(',')
            // console.log(strToArr)            
            newPlaylistOrder.push(element.id)
            setPlaylistOrder(newPlaylistOrder)
        });
        //console.log(dragArr)
        //setPlaylistOrder(draggables)
    }     
    
    function contDragOver(e){
        e.preventDefault()
        const afterElement = getDragAfterElement(e.clientY)
        //console.log(e.clientY)
        const draggable = document.querySelector('.dragging')
        if (afterElement == null) {
          container.appendChild(draggable)
        } else {
          container.insertBefore(draggable, afterElement)
    }}
      
    function getDragAfterElement(y) {
      const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]
    
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child }
        } else {
          return closest
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element
    } 


    return(
        <>
        <div className="border">
        </div>           
        <div className="container d-flex" >
            <div className="container border py-3 bg-dark col-9" >
                <input name="search" className="m-3 "type="text" placeholder="Search Songs/Artists" onChange={(e)=>setInput(e.target.value)}></input>       
                <div className="d-flex justify-content-start flex-column align-items-center"  style={{ maxHeight: "190vh", minHeight: "50vh", flexWrap: "wrap", width: "auto" }}>        
                    {inputRes.map(track=>
                    <div onClick={()=>addToPlaylist(track)} key={track.uri}>
                    <div className=" card mx-1 my-2 bg-dark-subtle text-end d-flex align-items-center hov fade-in" style={{ cursor: "pointer", width: "10rem" }}>
                        <img className="my-2 rounded" src={track.image} alt='caquita' style={{ height: "100px", width: "100px" }} draggable="false" />
                        <p className="text-center fw-semibold my-1">{track.title}</p>
                        <p className="text-muted text-center my-1">{track.artist}</p>
                    </div>             
                    </div>)}
                </div>       
            </div> 
            <section className="bg-warning col-3 border">
                <div className="container border p-0" style={{ height: "8rem", width: "auto" }} >
                <Player token={token} playlistOrder={playlistOrder}/>
                </div>
                <div id="fila" onDragOver={contDragOver}>
                {canciones.map((cancion) => 
                <div id={cancion.uri} className="border d-flex flex-row align-items-center my-1 card px-1 hov fade-in bg-dark-subtle draggable " draggable="true" style={{ cursor: "grab"}} onDragStart={dragStSong} onDragEnd={dragEndSong} key={cancion.uri}>
                        <img className="my-1 rounded" src={cancion.image} alt='caquita' style={{ height: "55px", width: "55px" }} />
                        <div className=" d-flex flex-column align-items-start" >
                            <p className=" m-1 d-inline-block text-truncate fw-semibold" style={{ fontSize: "0.8rem", maxWidth: "210px" }}>{cancion.title}</p>
                            <p className="text-muted m-1 d-inline-block text-truncate" style={{ fontSize: "0.8rem", maxWidth: "210px" }}>{cancion.artist}</p> 
                        </div>
                </div>            
                )}
                </div>
            </section>               
        </div>              
        </>                     
    )
  }


  
