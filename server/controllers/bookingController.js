const Booking = require('../models/Booking.js');
const OTP = require('../models/OTP');
const Event = require('../models/Event');
const { sendOTPEmail, sendBookingEmail } = require('../utils/email');


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendBookingOTP = async (req, res) => {
    const otp = generateOTP();
    await OTP.findandDelete({ email: req.user.email, action: 'event_booking' });
    await OTP.create({ email: req.user.email, otp, action: 'event_booking', expiresAt: Date.now() + 10 * 60 * 1000 });
    await sendOTPEmail(req.user.email, otp, 'event_booking');
    res.status(200).json({ message: 'OTP sent to your email' });
};

exports.bookEvent = async (req, res) => {
    const { eventId, otp } = req.body;
    const otpRecord = await OTP.findOne({ email: req.user.email, action: 'event_booking' });
    if (!otpRecord) {
        return res.status(400).json({ message: 'No OTP found for this email' });
    }
    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }
    if (event.totalSeats <= 0) {
        return res.status(400).json({ message: 'No seats available for this event' });
    }
    const existingBooking = await Booking.findOne({ user: req.user._id, event: eventId });
    if (existingBooking) {
        return res.status(400).json({ message: 'You have already booked this event' });
    }
    const booking = await Booking.create(
        {
            user: req.user._id,
            event: eventId,
            status: 'pending',
            paymentStatus: 'non_paid',
            amount: event.ticketPrice
        });
    await OTP.deleteMany({ email: req.user.email, action: 'event_booking' });
    res.status(200).json({ message: 'Booking created successfully. Please check your email for confirmation.' });
}
exports.confirmBooking = async (req, res) => {
    const paymentStatus = req.body.paymentStatus;
    if (!paymentStatus || !['paid', 'non_paid'].includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status' });
    }
    const booking = await Booking.findById(req.params.id).populate('eventId');
    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.status === 'confirmed') {
        return res.status(400).json({ message: 'Booking is already confirmed' });
    }
    const event = await Event.findById(booking.eventId);
    if (event.totalSeats <= 0) {
        return res.status(400).json({ message: 'No seats available for this event' });
    }
    booking.status = 'confirmed';
    if (paymentStatus) {
        booking.paymentStatus = paymentStatus;
    }
    await booking.save();
    event.totalSeats -= 1;
    await event.save();

    //admin confirm booking send email to user
    await sendBookingEmail(req.user.email, event.title, booking._id);
    res.status(200).json({ message: 'Booking confirmed successfully' });

}

exports.getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id }).populate('eventId');
    res.status(200).json(bookings);
};


exports.cancelBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    if (booking.status === 'confirmed') {
        const event = await Event.findById(booking.eventId);
        event.totalSeats += 1;
        await event.save();
    }
    await booking.remove();
    res.status(200).json({ message: 'Booking cancelled successfully' });
}