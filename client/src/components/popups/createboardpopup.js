import react, {useState} from "react";
import './createboardpopup.css';
import axios from 'axios';

function CreateBoardPopup ({isOpen, onClose}) {
    const [formData, setFormData] = useState({
        boardname: '',
        boarddescription: '',
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData, [name]: value
        });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:3001/api/v1/boards", formData);
        }catch(error){
            console.error('error', error)
        };
    };
};

export default CreateBoardPopup;