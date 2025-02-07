import React, { useEffect, useState } from 'react';
import './UserBookings.css'; // Optional CSS for styling

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      const userId = localStorage.getItem('userId'); // Ensure userId is stored after login
      if (!userId) {
        setError('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/bookings/user/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="user-bookings">
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>You have no bookings.</p>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.id} className="booking-card">
              <h3>Room: {booking.roomName}</h3>
              <p><b>Check-in:</b> {booking.checkInDate}</p>
              <p><b>Check-out:</b> {booking.checkOutDate}</p>
              <p><b>Total Amount:</b> ${booking.totalAmount}</p>
              <p><b>Payment Method:</b> {booking.paymentMethod}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserBookings;
