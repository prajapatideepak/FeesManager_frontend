import { toast } from 'react-toastify';

const Toaster = (status, message, position='top-right', duration=3000) => {
    return toast[status](message, {position, duration});
}

export default Toaster