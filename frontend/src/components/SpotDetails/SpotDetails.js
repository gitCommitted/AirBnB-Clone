import './SpotDetails.css';
import { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSpotDetail, getSpots } from '../../store/spots';
import { getBookings, getBookingDetail } from '../../store/bookings';
//import NewBooking from "../NewBookingForm/NewBookingForm"
import NewBookModal from '../NewBookingForm/NewBookMode';
import { Modal } from '../../context/Modal';
import placeholder from "../HomePage/placeholdr.png"
const SpotDetails = () => {
    const dispatch= useDispatch();

    const [showModal, setShowModal] = useState(false);

    const { spotId } = useParams();
    const [newForm, setNewForm]=useState('false')
    const [showingNewForm, setShowingNewForm]=useState('')
   
    const userId = useSelector(state => state.session.user['id'])
    useEffect(() => {
        dispatch(getSpots())
        dispatch(getSpotDetail(spotId))
        dispatch(getBookingDetail(spotId))
      }, [dispatch]);
    const spot = useSelector(state => state.spots);
    console.log("spot.spots: ",spot.Spots)
      let thisSpot
       const bookingz = useSelector(state => state.bookings.this);
       
      console.log("spot Id: ",spotId)
      let bookings = []
      if (bookingz && bookingz.Bookings){
        console.log("bookinz: ",bookingz.Bookings)
          bookingz.Bookings.forEach((el)=>{
            if (el.spotId==spotId){
                bookings.push(el)
            }
          }
          )
        }
    //     console.log("bookinz: ",bookingz)
    //     console.log("spot Id: ",spotId)
       console.log("bookings: ",bookings)
if (spot.Spots){
    spot.Spots.forEach((el)=>{
        if(el.id==spotId){
            thisSpot=el
        }
    })
}
let displayed=false
if (thisSpot){
  if ( thisSpot.ownerId===userId){
    displayed=true
  }
}
console.log("display: ",displayed)
const linkerN = () => {
    return (
        <>
        <button 
        type="submit"
        disabled={displayed}
        onClick = {(e) => 
            {
                //newForm === 'true' ? setNewForm('false') : setNewForm('true')
               
                //console.log(showingEditForm)
                //console.log(editForm)

                setShowModal(true)
            }
        }
        >Book This Spot</button>
        {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <NewBookModal spotId={spotId}/>
        </Modal>
      )}



        </>
    )
}

console.log("thisSpot: ",thisSpot)
let deets
if (spot.Spots){
    deets = (
    <>
        <ul>
        <li>
        <img src={thisSpot.previewImage ? thisSpot.previewImage : placeholder} alt="no image available"/>
        </li>
        <li>
        Name: {thisSpot.name}
    </li>
     <li>
        Id: {thisSpot.id}
    </li>
    <li>
        Price: {thisSpot.price}
    </li>
    <li>
        Description: {thisSpot.description}
    </li>
    <li>
        Address: {thisSpot.address}
    </li>
    <li>
        City: {thisSpot.city}
    </li>
    <li>
        State: {thisSpot.state}
    </li>
   
    
    <li>
        Owner ID: {
        thisSpot.ownerId===userId ? (<>You own this spot, you cannot book it</>) : (<>{thisSpot.ownerId}</>)
        }
    </li>


   </ul>
   
      </>
    )
}

    return (
        <>
        <div className='title'>Spot Details:</div>
        <div className='theGridD'>
        {deets}
       
        {bookings && spot.Spots && bookings.length ? (
            <div>
    <div>The Following Dates Are Not Available:</div>
    <ul>
    {bookings.map((booking)=>(
    <>
     
     <li>{booking.startDate} --- {booking.endDate}</li>
     
     </>
     ))}
    </ul>
  </div>) : (
      <div>Not Booked, All Dates Available!</div>
  )}
   {/* {newForm === 'true' ? (
            <>
            <NewBooking spotId={spotId}/>
            <button onClick = {(e) => setNewForm('false')}>Cancel</button>
            </>
        ) : linkerN()} */}
        {linkerN()}


    
         
        </div>
        </>
    )
}

export default SpotDetails;