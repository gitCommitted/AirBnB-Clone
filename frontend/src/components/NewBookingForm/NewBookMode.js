import './NewBookMode.css';

import { useState, useEffect } from 'react';
import { useParams, NavLink, useHistory, Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createBooking, getBookings } from '../../store/bookings'


    

const NewBookModal = (id) => {

    const dispatch= useDispatch();
    const history = useHistory();
    //let id = useParams();
   
    let spotId = Number(id.spotId)
    //console.log(spotId)
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [errors, setErrors] = useState([]);
    let newBook
   
    const spot = useSelector(state => state.spots);
    const userId = useSelector(state => state.session.user['id'])
    if (newBook) return <Redirect to="/mybookings" />;
    //console.log(userId)
//console.log(spot)
    const handleSubmit = (e) => {
        e.preventDefault();
        
          setErrors([]);
                      //   if (newBook){
            //         dispatch(getBookings())
                  
            //   }
            //  console.log(newBook)
            return dispatch(createBooking({ spotId, userId, startDate,endDate }))
            .then(() => history.push('/mybookings'))
            .catch(async (res) => {
              const data = await res.json();
              console.log(data)
              if (data && data.errors) setErrors(Object.values(data.errors));
            });
        
        // return setErrors(['Confirm Password field must be the same as the Password field']);
      };
let deets
if (spotId){
    deets=(
<form onSubmit={handleSubmit} className='modal-container'>
   
      <h3 className='modal-title'>New Booking</h3>
      <ul>
       
       {errors.map((error, idx) => <li key={idx}>{error}</li>)}
     </ul>
      <label className='modal-input-title-label' htmlFor='start' >
        Start Date
      </label>
        <input
        className='modal-input-title'
        name='start'
          type="text"
          value={startDate}
          placeholder='DD/MM/YYY'
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      
      <label className='modal-input-title-label' htmlFor='end'>
        End Date
      </label>
        <input
        className='modal-input-title'
        name='end'
          type="text"
          value={endDate}
          placeholder='DD/MM/YYY'
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
  

      <button type="submit"
      className='login-btn modal-btn modal-submit-btn'
      >Book Now</button>
    </form>
    )}




    return (
       <>
       {deets}
       </> 
       
    )
}

export default NewBookModal;